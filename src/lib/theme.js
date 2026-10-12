// Banner colors per category (used until a card has its own image).
const COL = {
  Cooking: ['#ffb36b', '#e8574a'], Cars: ['#6fa8dc', '#2c4a7c'], Money: ['#7bd389', '#1f7a5c'],
  Home: ['#f0c27b', '#a8643a'], Mind: ['#c7a6ff', '#5b3fa8'], Tech: ['#6be0e0', '#2b5fd9'],
  Social: ['#ff9ec2', '#c2417a'], Health: ['#ffd86b', '#e8893a'], Adulting: ['#b9c6d2', '#4a5e73'],
  Books: ['#d9b48f', '#7a4e2d'], Nature: ['#9ad48a', '#3c7a3f'], Science: ['#8fd0e8', '#2a6f97'],
}
export const colorsFor = (name) => COL[name] || ['#c9d3da', '#5d6b78']
