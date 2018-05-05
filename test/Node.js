
let node = new Node()

node.load({}, {
  name: 'hahaha',
  components: {
    Account: {enable: true},
    Inventory: {enable: false},
    Input: {enable: false},
    Output: {enable: false}
  }
}).then(a => {
  // console.log(a)
}).catch(err => {
  console.error(err)
})
