const COMPONENTS_FACTORY_COMPONENTS = [
  {
    type: 'Account',
    enable: true
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
      batchSize: 10
    }
  },
  {
    type: 'IO',
    enable: true,
    options: {
      transportationCost: 100,
      batchSize: 4
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
    enable: true
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
      transportationCost: 150,
      batchSize: 4
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
    enable: true
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
      transportationCost: 200,
      batchSize: 4
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
      downstreamProvider: 'CarsMarket'
    }
  }
]

export default {
  name: 'Engine Testing',
  gameDays: 3,
  dayLength: 10,
  nodes: [
    {
      name: 'ComponentsFactory#1',
      components: COMPONENTS_FACTORY_COMPONENTS,
      wage: 100,
      workers: 8
    },
    {
      name: 'ComponentsFactory#2',
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
            upstreams: ['ComponentsFactory#1', 'ComponentsFactory#2'],
            downstreams: ['AssemblyFactory#1', 'AssemblyFactory#2'],
            breakoffPaneltyRatio: 1.2,
            breakoffCompensationRatio: 0.5,
            transportationTime: 300,
            transportationStatus: 'DELIVERING'
          }
        },
        {type: 'Account', enable: true},
        {type: 'Inventory', enable: false},
        {type: 'IO', enable: false}
      ]
    },
    {
      name: 'AssemblyFactory#1',
      components: ASSEMBLY_FACTORY_COMPONENTS,
      wage: 150,
      workers: 2
    },
    {
      name: 'AssemblyFactory#2',
      components: ASSEMBLY_FACTORY_COMPONENTS,
      wage: 150,
      workers: 2
    },
    {
      name: 'CarsBiddingMarket',
      components: [
        {
          type: 'BiddingMarket',
          enable: true,
          options: {
            upstreams: ['AssemblyFactory#1', 'AssemblyFactory#2'],
            downstreams: ['Retailer#1', 'Retailer#2'],
            breakoffPaneltyRatio: 1.2,
            breakoffCompensationRatio: 0.5,
            transportationTime: 300,
            transportationStatus: 'DELIVERING'
          }
        },
        {type: 'Account', enable: true},
        {type: 'Inventory', enable: false},
        {type: 'IO', enable: false}
      ]
    },
    {
      name: 'Retailer#1',
      components: RETAILER_COMPONENTS,
      wage: 200,
      workers: 2
    },
    {
      name: 'Retailer#2',
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
            upstreams: ['AssemblyFactory#1', 'AssemblyFactory#2'],
            news: [

            ]
          }
        },
        {type: 'Account', enable: true},
        {type: 'Inventory', enable: true},
        {type: 'IO', enable: true}
      ]
    }
  ]
}
