const COMPONENTS_FACTORY_COMPONENTS = [
  {
    type: 'Account',
    enable: true,
    options: {
      initialCash: 10000
    }
  },
  {
    type: 'Inventory',
    enable: true,
    options: {
      hasStorageCost: true,
      storageCost: [
        {
          good: 'Engine',
          costPerBatch: 5
        },
        {
          good: 'Body',
          costPerBatch: 10
        },
        {
          good: 'Wheel',
          costPerBatch: 6
        }
      ],
      batchSize: 10,
      mode: 'PERIODIC'
    }
  },
  {
    type: 'IO',
    enable: true,
    options: {
      transportationTime: 5,
      transportationCost: 100,
      batchSize: 4,
      availableImportGoods: [{good: 'Wheel'}, {good: 'Body'}, {good: 'Engine'}],
      availableExportGoods: [{good: 'Wheel'}, {good: 'Body'}, {good: 'Engine'}]
    }
  },
  {
    type: 'BiddingMarketReceiver',
    enable: true,
    options: {
      downstreamProvider: 'ComponentsBiddingMarket'
    }
  }
]

const ASSEMBLY_FACTORY_COMPONENTS = [
  {
    type: 'Account',
    enable: true,
    options: {
      initialCash: 10000
    }
  },
  {
    type: 'Inventory',
    enable: true,
    options: {
      hasStorageCost: true,
      storageCost: [
        {
          good: 'Engine',
          costPerBatch: 5
        },
        {
          good: 'Body',
          costPerBatch: 10
        },
        {
          good: 'Wheel',
          costPerBatch: 6
        },
        {
          good: 'Car',
          costPerBatch: 20
        }
      ],
      batchSize: 10
    }
  },
  {
    type: 'IO',
    enable: true,
    options: {
      transportationTime: 5,
      transportationCost: 150,
      batchSize: 4,
      availableImportGoods: [{good: 'Wheel'}, {good: 'Body'}, {good: 'Engine'}],
      availableExportGoods: [{good: 'Car'}]
    }
  },
  {
    type: 'BiddingMarketReceiver',
    enable: true,
    options: {
      upstreamProvider: 'ComponentsBiddingMarket',
      downstreamProvider: 'CarsBiddingMarket'
    }
  }
]

const RETAILER_COMPONENTS = [
  {
    type: 'Account',
    enable: true,
    options: {
      initialCash: 10000
    }
  },
  {
    type: 'Inventory',
    enable: true,
    options: {
      hasStorageCost: true,
      storageCost: [
        {
          good: 'Car',
          costPerBatch: 40
        }
      ],
      batchSize: 10
    }
  },
  {
    type: 'IO',
    enable: true,
    options: {
      transportationTime: 5,
      transportationCost: 200,
      batchSize: 4,
      availableImportGoods: [{good: 'Car'}],
      availableExportGoods: [{good: 'Car'}]
    }
  },
  {
    type: 'BiddingMarketReceiver',
    enable: true,
    options: {
      upstreamProvider: 'CarsBiddingMarket'
    }
  },
  {
    type: 'MarketReceiver',
    enable: true,
    options: {
      provider: 'Market'
    }
  }
]

export const NODES = [
  {
    name: 'ComponentsFactory-1',
    components: COMPONENTS_FACTORY_COMPONENTS,
    wage: 100,
    workers: 8
  },
  {
    name: 'ComponentsFactory-2',
    components: COMPONENTS_FACTORY_COMPONENTS,
    wage: 100,
    workers: 8
  },
  {
    name: 'ComponentsBiddingMarket',
    components: [
      {
        type: 'BiddingMarket',
        enable: true,
        options: {
          upstreams: ['ComponentsFactory-1', 'ComponentsFactory-2'],
          downstreams: ['AssemblyFactory-1', 'AssemblyFactory-2'],
          breakoffPaneltyRatio: 1.2,
          breakoffCompensationRatio: 0.5,
          transportationTime: 5,
          transportationStatus: 'DELIVERING'
        }
      },
      {
        type: 'Account',
        enable: true,
        options: {
          initialCash: 100000000
        }
      },
      {type: 'Inventory', enable: false},
      {type: 'IO', enable: false},
      {
        type: 'InventoryRegister',
        enable: true,
        options: {
          receivers: ['ComponentsFactory-1', 'ComponentsFactory-2']
        }
      }
    ]
  },
  {
    name: 'AssemblyFactory-1',
    components: ASSEMBLY_FACTORY_COMPONENTS,
    wage: 150,
    workers: 2
  },
  {
    name: 'AssemblyFactory-2',
    components: ASSEMBLY_FACTORY_COMPONENTS,
    wage: 150,
    workers: 2
  },
  {
    name: 'AssemblyDepartment',
    components: [
      {
        type: 'AssemblyDepartment',
        enable: true,
        options: {
          receivers: ['AssemblyFactory-1', 'AssemblyFactory-2'],
          bom: [
            {
              good: 'Car',
              components: [
                {
                  good: 'Wheel',
                  unit: 4
                },
                {
                  good: 'Body',
                  unit: 1
                },
                {
                  good: 'Engine',
                  unit: 1
                }
              ]
            }
          ]
        }
      },
      {
        type: 'Account',
        enable: true,
        options: {
          initialCash: 100000000
        }
      },
      {type: 'Inventory', enable: false},
      {type: 'IO', enable: false}
    ]
  },
  {
    name: 'CarsBiddingMarket',
    components: [
      {
        type: 'BiddingMarket',
        enable: true,
        options: {
          upstreams: ['AssemblyFactory-1', 'AssemblyFactory-2'],
          downstreams: ['Retailer-1', 'Retailer-2'],
          breakoffPaneltyRatio: 1.2,
          breakoffCompensationRatio: 0.5,
          transportationTime: 5,
          transportationStatus: 'DELIVERING'
        }
      },
      {
        type: 'Account',
        enable: true,
        options: {
          initialCash: 100000000
        }
      },
      {type: 'Inventory', enable: false},
      {type: 'IO', enable: false}
    ]
  },
  {
    name: 'Retailer-1',
    components: RETAILER_COMPONENTS,
    wage: 200,
    workers: 2
  },
  {
    name: 'Retailer-2',
    components: RETAILER_COMPONENTS,
    wage: 200,
    workers: 2
  },
  {
    name: 'Market',
    components: [
      {
        type: 'Market',
        enable: true,
        options: {
          upstreams: ['Retailer-1', 'Retailer-2'],
          news: [
            {
              title: 'Sample News Day1',
              content: 'Haha...',
              releasedGameTime: {
                day: 1,
                time: 0,
                isWorking: true
              },
              marketNeeds: [
                {
                  good: 'Car',
                  unit: 30,
                  unitPrice: 100
                }
              ]
            }
          ]
        }
      },
      {
        type: 'Account',
        enable: true,
        options: {
          initialCash: 100000000
        }
      },
      {type: 'Inventory', enable: true},
      {
        type: 'IO',
        enable: true,
        options: {
          availableImportGoods: [{good: 'Car'}]
        }
      }
    ]
  }
]

export const PERMISSIONS = [
  {
    level: 'STAFF',
    teams: [
      {
        index: 0,
        name: 'Staff',
        roles: [
          {
            role: 'Console',
            name: 'GM',
            describe: 'GM',
            objectTypes: [
              {type: 'ComponentsFactory-1'},
              {type: 'ComponentsFactory-2'},
              {type: 'ComponentsBiddingMarket'},
              {type: 'AssemblyFactory-1'},
              {type: 'AssemblyFactory-2'},
              {type: 'AssemblyDepartment'},
              {type: 'CarsBiddingMarket'},
              {type: 'Retailer-1'},
              {type: 'Retailer-2'},
              {type: 'Market'},
              {type: 'Engine'}
            ]
          },
          {
            role: 'Scoreboard',
            name: 'Scoreboard',
            describe: 'Scoreboard',
            objectTypes: [
              {type: 'ComponentsFactory-1'},
              {type: 'ComponentsFactory-2'},
              {type: 'AssemblyFactory-1'},
              {type: 'AssemblyFactory-2'},
              {type: 'Retailer-1'},
              {type: 'Retailer-2'},
              {type: 'Engine'}
            ]
          },
          {
            role: 'ComponentsBiddingMarket',
            name: 'ComponentsBiddingMarket',
            describe: 'ComponentsBiddingMarket',
            objectTypes: [
              {type: 'ComponentsFactory-1'},
              {type: 'ComponentsFactory-2'},
              {type: 'ComponentsBiddingMarket'},
              {type: 'AssemblyFactory-1'},
              {type: 'AssemblyFactory-2'},
              {type: 'Engine'}
            ]
          },
          {
            role: 'AssemblyDepartment',
            name: 'AssemblyDepartment',
            describe: 'AssemblyDepartment',
            objectTypes: [
              {type: 'AssemblyFactory-1'},
              {type: 'AssemblyFactory-2'},
              {type: 'AssemblyDepartment'},
              {type: 'Engine'}
            ]
          },
          {
            role: 'CarsBiddingMarket',
            name: 'CarsBiddingMarket',
            describe: 'CarsBiddingMarket',
            objectTypes: [
              {type: 'AssemblyFactory-1'},
              {type: 'AssemblyFactory-2'},
              {type: 'AssemblyDepartment'},
              {type: 'CarsBiddingMarket'},
              {type: 'Retailer-1'},
              {type: 'Retailer-2'},
              {type: 'Engine'}
            ]
          },
          {
            role: 'Market',
            name: 'Market',
            describe: 'Market',
            objectTypes: [
              {type: 'Retailer-1'},
              {type: 'Retailer-2'},
              {type: 'Market'},
              {type: 'Engine'}
            ]
          }
        ]
      }
    ]
  },
  {
    level: 'PLAYER',
    teams: [
      {
        index: 1,
        name: 'Team 1',
        roles: [
          {
            role: 'ComponentsFactory',
            name: 'ComponentsFactory',
            describe: 'ComponentsFactory',
            objectTypes: [
              {type: 'ComponentsFactory-1'},
              {type: 'Engine'}
            ]
          },
          {
            role: 'AssemblyFactory',
            name: 'AssemblyFactory',
            describe: 'AssemblyFactory',
            objectTypes: [
              {type: 'AssemblyFactory-1'},
              {type: 'Engine'}
            ]
          },
          {
            role: 'Retailer',
            name: 'Retailer',
            describe: 'Retailer',
            objectTypes: [
              {type: 'Retailer-1'},
              {type: 'Engine'}
            ]
          }
        ]
      },
      {
        index: 2,
        name: 'Team 2',
        roles: [
          {
            role: 'ComponentsFactory',
            name: 'ComponentsFactory',
            describe: 'ComponentsFactory',
            objectTypes: [
              {type: 'ComponentsFactory-2'},
              {type: 'Engine'}
            ]
          },
          {
            role: 'AssemblyFactory',
            name: 'AssemblyFactory',
            describe: 'AssemblyFactory',
            objectTypes: [
              {type: 'AssemblyFactory-2'},
              {type: 'Engine'}
            ]
          },
          {
            role: 'Retailer',
            name: 'Retailer',
            describe: 'Retailer',
            objectTypes: [
              {type: 'Retailer-2'},
              {type: 'Engine'}
            ]
          }
        ]
      }
    ]
  }
]

export const SHORT_ENGINE_CONFIG = {
  name: 'Short Engine Testing',
  describe: '',
  gameDays: 2,
  dayLength: 10,
  nodes: NODES,
  permissions: PERMISSIONS
}

export const LONG_ENGINE_CONFIG = {
  name: 'Long Engine Testing',
  describe: '',
  gameDays: 5,
  dayLength: 10,
  nodes: NODES,
  permissions: PERMISSIONS
}
