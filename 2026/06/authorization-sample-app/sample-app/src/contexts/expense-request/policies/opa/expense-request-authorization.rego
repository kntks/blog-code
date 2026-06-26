package expense_request

import rego.v1

default allow := false

allow if {
  input.action == "create"
  input.actor.role == "member"
}

allow if {
  input.action == "create"
  input.actor.role == "manager"
}

allow if {
  input.action == "create"
  input.actor.role == "admin"
}

allow if {
  input.action == "view"
  input.resource.applicantId == input.actor.identityUserId
}

allow if {
  input.action == "view"
  input.actor.role == "admin"
  input.resource.status != "draft"
}

allow if {
  input.action == "view"
  input.actor.role == "manager"
  input.resource.departmentId == input.actor.departmentId
  input.resource.status != "draft"
}

allow if {
  input.action == "viewReceipt"
  input.resource.applicantId == input.actor.identityUserId
}

allow if {
  input.action == "viewReceipt"
  input.actor.role == "admin"
  input.resource.status != "draft"
}

allow if {
  input.action == "viewReceipt"
  input.actor.role == "manager"
  input.resource.departmentId == input.actor.departmentId
  input.resource.status != "draft"
}

allow if {
  input.action == "edit"
  input.resource.applicantId == input.actor.identityUserId
}

allow if {
  input.action == "submit"
  input.resource.applicantId == input.actor.identityUserId
}

allow if {
  input.action == "withdraw"
  input.resource.applicantId == input.actor.identityUserId
}

allow if {
  input.action == "delete"
  input.resource.applicantId == input.actor.identityUserId
}

allow if {
  input.action == "approve"
  input.actor.role == "admin"
}

allow if {
  input.action == "approve"
  input.actor.role == "manager"
  input.resource.departmentId == input.actor.departmentId
}

allow if {
  input.action == "reject"
  input.actor.role == "admin"
}

allow if {
  input.action == "reject"
  input.actor.role == "manager"
  input.resource.departmentId == input.actor.departmentId
}

allow if {
  input.action == "invalidate"
  input.actor.role == "admin"
}

allow if {
  input.action == "settle"
  input.actor.role == "admin"
}
