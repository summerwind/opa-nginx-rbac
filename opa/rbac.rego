package httpapi.rbac

import input as req

import data.roles
import data.role_bindings

default allow = false

allow {
  user_bindings = role_bindings[req.user][_]
  user_roles = roles[user_bindings]
  user_rules = user_roles[req.path]
  user_rules[_] = req.method
}