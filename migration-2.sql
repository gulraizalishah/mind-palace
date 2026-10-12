-- =====================================================================
-- MIND PALACE: MIGRATION 2 (your own memories + stickers)
-- Run once in Supabase > SQL Editor, AFTER supabase-schema-full.sql.
-- Adds: personal memories, a sticker (emoji) on every saved item.
-- =====================================================================

-- A saved item can now be a card OR the user's own memory (card_id is empty).
alter table saved_cards alter column card_id drop not null;
alter table saved_cards add column if not exists custom_title   text;
alter table saved_cards add column if not exists custom_content text;
alter table saved_cards add column if not exists emoji          text;
alter table saved_cards add constraint saved_has_content
  check (card_id is not null or char_length(coalesce(custom_title, '')) between 1 and 140);
alter table saved_cards add constraint saved_text_len
  check (char_length(coalesce(custom_content, '')) <= 1000);
alter table saved_cards add constraint saved_emoji_len
  check (emoji is null or char_length(emoji) <= 16);

alter table review_history alter column card_id drop not null;
alter table review_history add column if not exists saved_card_id uuid references saved_cards on delete set null;

-- Palace object uses the sticker when there is one.
create or replace function create_palace_item() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into palace_items (user_id, saved_card_id, room_id, object_type, position_x, position_y)
  values (new.user_id, new.id, new.room_id,
          coalesce(new.emoji, (select visual_object from knowledge_cards where id = new.card_id)),
          10 + random() * 80, 10 + random() * 60);
  return new;
end $$;

-- Save a card, optionally with a room and a sticker.
drop function if exists save_card(uuid, int);
create function save_card(p_card uuid, p_room int default null, p_emoji text default null)
returns saved_cards
language plpgsql security invoker as $$
declare r saved_cards;
begin
  insert into saved_cards (user_id, card_id, room_id, emoji)
  values (auth.uid(), p_card,
          coalesce(p_room, (select default_room_id from knowledge_cards where id = p_card)),
          p_emoji)
  on conflict (user_id, card_id) do nothing
  returning * into r;
  if r.id is null then
    select * into r from saved_cards where user_id = auth.uid() and card_id = p_card;
  end if;
  return r;
end $$;

-- Add something from your own mind.
create function add_memory(p_title text, p_content text, p_room int, p_emoji text)
returns saved_cards
language plpgsql security invoker as $$
declare r saved_cards;
begin
  if char_length(trim(coalesce(p_title, ''))) = 0 then raise exception 'Write what you want to remember'; end if;
  insert into saved_cards (user_id, card_id, room_id, custom_title, custom_content, emoji)
  values (auth.uid(), null, p_room, trim(p_title), nullif(trim(coalesce(p_content, '')), ''), p_emoji)
  returning * into r;
  return r;
end $$;

-- Change the sticker on any saved item.
create function set_sticker(p_saved uuid, p_emoji text)
returns saved_cards
language sql security invoker as $$
  update saved_cards set emoji = p_emoji where id = p_saved and user_id = auth.uid() returning *
$$;

-- Review answers now also work for personal memories.
create or replace function answer_review(p_saved uuid, p_correct boolean)
returns saved_cards
language plpgsql security invoker as $$
declare s saved_cards; iv jsonb; mins int; st int; nxt timestamptz;
begin
  select * into s from saved_cards where id = p_saved and user_id = auth.uid() for update;
  if not found then raise exception 'saved card not found'; end if;
  select value into iv from app_settings where key = 'review_intervals_days';
  select (value #>> '{}')::int into mins from app_settings where key = 'wrong_retry_minutes';
  if p_correct then
    st  := least(s.stage + 1, jsonb_array_length(iv) - 1);
    nxt := now() + make_interval(days => (iv ->> st)::int);
  else
    st  := greatest(s.stage - 1, 0);
    nxt := now() + make_interval(mins => mins);
  end if;
  update saved_cards set
    stage = st, next_review_at = nxt, last_reviewed_at = now(),
    review_count = review_count + 1,
    correct_count = correct_count + (case when p_correct then 1 else 0 end),
    incorrect_count = incorrect_count + (case when p_correct then 0 else 1 end)
  where id = s.id returning * into s;
  insert into review_history (user_id, card_id, saved_card_id, correct, next_review_at)
  values (auth.uid(), s.card_id, s.id, p_correct, nxt);
  return s;
end $$;

-- Due list: cards use their quiz question, personal memories use flashcards.
drop view if exists due_reviews;
create view due_reviews with (security_invoker = true) as
  select s.id as saved_id, s.card_id, s.room_id, s.stage, s.next_review_at, s.emoji,
         coalesce(c.title, s.custom_title)     as title,
         coalesce(c.content, s.custom_content) as content,
         c.question, c.correct_answer, c.wrong_answers,
         (s.card_id is null) as is_personal
  from saved_cards s left join knowledge_cards c on c.id = s.card_id
  where s.user_id = auth.uid() and s.next_review_at <= now()
    and (c.question is not null or s.card_id is null)
  order by s.next_review_at;

-- Search covers your own memories too.
create or replace function search_saved(q text)
returns table (saved_id uuid, card_id uuid, room_id int, title text, content text)
language sql stable security invoker as $$
  select s.id, s.card_id, s.room_id, coalesce(c.title, s.custom_title), coalesce(c.content, s.custom_content)
  from saved_cards s left join knowledge_cards c on c.id = s.card_id
  where s.user_id = auth.uid()
    and (c.search @@ websearch_to_tsquery('english', q)
      or to_tsvector('english', coalesce(s.custom_title, '') || ' ' || coalesce(s.custom_content, ''))
         @@ websearch_to_tsquery('english', q))
$$;
