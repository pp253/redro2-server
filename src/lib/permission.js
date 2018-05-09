import _ from 'lodash'

/**
 * @typedef PermissionBase
 * @property {Boolean} [identity]
 * @property {Boolean|Map<String, PermissionBase>} [children]
 * @property {Boolean} [all]
 * @property {Boolean|Map<String, Boolean|Map<String, Boolean>>} [permissions]
 * @property {Boolean|Map<String, Boolean|Map<String, Boolean>>} [self]
 * @property {Boolean|Map<String, Boolean|Map<String, Boolean>>} [other]
 * @property {String} [defaultRole] default role
 */

/**
 * @type PermissionBase
 */
let PermissionBase = {}

let permissionRoot = ''

/**
 * @typedef RolePermission
 * @property {String} role
 * @property {Array<String>} [subset]
 * @property {Array<String>} [alias]
 * @property {Boolean} [all]
 * @property {Map<String, Boolean>} [permissions]
 */

/**
 * @typedef PermissionTemplate
 * @property {String} name
 * @property {Boolean} [root]
 * @property {Array<PermissionTemplate>} [children]
 * @property {Boolean} [all]
 * @property {Boolean|Array<RolePermission>} [permissions]
 * @property {Boolean} [identity]
 * @property {Boolean|Array<RolePermission>} [self]
 * @property {Boolean|Array<RolePermission>} [other]
 */

/**
 *
 * @param {PermissionTemplate} template
 * @param {PermissionBase} base
 * @returns {PermissionBase}
 */
export function convertPermissionTemplate (template) {
  let base = {}

  if ('root' in template && template.root === true) {
    base.root = true
  }

  if ('identity' in template && template.identity === true) {
    base.identity = true
    if ('self' in template !== undefined) {
      base.self = convertRolePermission(template.self)
    }
    if ('other' in template !== undefined) {
      base.other = convertRolePermission(template.other)
    }
  } else {
    base.identity = false
  }

  if ('permissions' in template) {
    base.permissions = convertRolePermission(template.permissions)
  }

  if ('children' in template) {
    base.children = new Map()
    for (let child of template.children) {
      base.children.set(child.name, convertPermissionTemplate(child))
    }
  }

  return base
}

/**
 *
 * @param {Boolean|Array<RolePermission>} rolesPermission
 * @returns {Boolean|Map<String, Boolean|Map<String, Boolean>>}
 */
function convertRolePermission (rolesPermission) {
  if (typeof rolesPermission === 'boolean') {
    return rolesPermission
  } else if (rolesPermission instanceof Array) {
    /**
     * @type Map<String, Boolean|Map<String, Boolean>>
     */
    let roleList = new Map()
    for (let rolePermission of rolesPermission) {
      let result
      // all
      if ('all' in rolePermission) {
        result = rolePermission.all
      } else {
        result = rolePermission.permissions ? rolePermission.permissions : {}
        // subset
        if ('subset' in rolePermission) {
          if (typeof rolePermission.subset === 'string') {
            result = Object.assign({}, getSubset(rolesPermission, [rolePermission.subset]), result)
          } else if (rolePermission.subset instanceof Array) {
            result = Object.assign({}, getSubset(rolesPermission, rolePermission.subset), result)
          }
        }

        result = new Map(_.toPairs(result))
      }

      // alias
      if ('alias' in rolePermission) {
        if (typeof rolePermission.alias === 'string') {
          roleList.set(rolePermission.alias, result)
        } else if (rolePermission instanceof Array) {
          for (let role of rolePermission.alias) {
            roleList.set(role, result)
          }
        }
      }

      roleList.set(rolePermission.role, result)
    }

    return roleList
  }
}

/**
 *
 * @param {Array<RolePermission>} rolePermissionList
 * @param {Array<String>} subsetList
 * @returns {Map<String, Boolean>}
 */
function getSubset (rolePermissionList, subsetList) {
  let permissions = {}
  for (let subset of subsetList) {
    let rp = rolePermissionList.find(rp => rp.role === subset)
    let subsetPermission = Object.assign({}, rp.subset ? getSubset(rolePermissionList, rp.subset) : {}, rp.permissions)
    permissions = Object.assign(subsetPermission, permissions)
  }
  return permissions
}

/**
 *
 * @param {PermissionBase} permissionBase
 */
export function setPermissionBase (permissionBase) {
  PermissionBase = permissionBase
  return PermissionBase
}

/**
 * @typedef UserRoles
 * @property {String} [role]
 * @property {UserRoles|Map<String, UserRoles>} [x] as child name
 */

/**
 *
 * @param {UserRoles} roles
 * @param {String} permission
 * @returns {Boolean}
 */
export function check (roles, permission) {
  let pl = permission.split('.')
  let cr = roles
  let cpb = PermissionBase
  let lastRole = roles.role

  for (let index = 0; index < pl.length;) {
    let p = pl[index]
    if (cpb.children.has(p)) {
      // Child
      let pb = cpb.children.get(p)
      if (pb.identity) {
        // Child has identity
        let id = pl[index + 1]
        if (id === undefined) {
          throw new Error('Permission:check() permission string should its identity.')
        }

        if (cr[p].has(id) && cr[p].get(id).role) {
          // Self
          let role = cr[p].get(id).role
          let p = pb.
          if (condition) {
            
          }
        } else {
          // Other
          let role = lastRole
        }

      }
    }
  }
}
