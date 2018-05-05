
let account = new Account()
account.load({}, {}).then(account => {
  return account.add({
    debit: [{
      amount: 100,
      classification: 'Cash'
    }],
    credit: [{
      amount: 100,
      classification: 'Sales'
    }],
    memo: 'TEST',
    time: Date.now(),
    gameTime: {
      time: 0,
      day: 0,
      isWorking: false
    },
    unbalance: false
  })
})
.then(account => {
  console.log(account)
}).catch(err => {
  console.error(err)
})
