/* eslint-env node, mocha */
import * as permission from '@/lib/permission'

describe('Permission', function (done) {
  const SAMPLE_CHILD_PERMISSION_TEMPLATE = {
    name: 'engine',
    children: [],
    identity: true,
    self: [
      {
        role: 'guest',
        permissions: {
          'everyoneShouldHaveThisPermission': true
        }
      },
      {
        role: 'admin',
        subset: ['guest'],
        alias: ['teammember'],
        permissions: {
          'onlyAdminHave': true,
          'onlyGuestDontHave': true
        }
      },
      {
        role: 'root',
        subset: ['admin'],
        permissions: {
          'onlyAdminHave': false,
          'onlyRootHave': true,
          '*': true
        }
      }
    ],
    other: [
      {
        role: 'root',
        permissions: {
          '*': true
        }
      }
    ]
  }

  const SAMPLE_IDENTITY_PERMISSION_TEMPLATE = {
    name: 'server',
    children: [SAMPLE_CHILD_PERMISSION_TEMPLATE],
    identity: true,
    self: [
      {
        role: 'guest',
        permissions: {
          'everyoneShouldHaveThisPermission': true
        }
      },
      {
        role: 'admin',
        subset: ['guest'],
        alias: ['teammember'],
        permissions: {
          'onlyAdminHave': true,
          'onlyGuestDontHave': true
        }
      },
      {
        role: 'root',
        subset: ['admin'],
        permissions: {
          'onlyAdminHave': false,
          'onlyRootHave': true,
          '*': true
        }
      }
    ],
    other: [
      {
        role: 'root',
        permissions: {
          '*': true
        }
      }
    ]
  }

  const USER_ROLES_GUEST = {
    role: 'guest',
    engine: new Map([
      ['0', {
        role: 'admin'
      }],
      ['1', {
        role: 'guest'
      }]
    ])
  }

  it('should convert the permission template.', function (done) {
    let converted = permission.convertPermissionTemplate(SAMPLE_IDENTITY_PERMISSION_TEMPLATE)
    console.log(converted)
    done()
  })

  it('should set the permission.', function (done) {
    let converted = permission.convertPermissionTemplate(SAMPLE_IDENTITY_PERMISSION_TEMPLATE)
    permission.setPermissionBase(converted)
    done()
  })

  it('should check the permission.', function (done) {
    
    done()
  })
})
