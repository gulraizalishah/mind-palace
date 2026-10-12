export default function SaveButton({ roomName, onClick }) {
  return (
    <button className="btn" disabled={!!roomName} onClick={onClick}>
      {roomName ? `Saved to ${roomName} ✓` : 'Save to Palace'}
    </button>
  )
}
