package ace.policies.tagging

default allow = false

allow {
  input.resource_type == "aws_vpc"
  input.changes.after.tags.Environment != ""
  input.changes.after.tags.Name != ""
}

allow {
  input.resource_type == "aws_eks_cluster"
  input.changes.after.tags.Environment != ""
}

deny[msg] {
  not allow
  msg = sprintf("Resource %s must include Environment and Name tags", [input.resource_address])
}

