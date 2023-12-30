source "docker" "example" {
  image  = var.image
  commit = true
  changes = [
    "LABEL build=packer"
  ]
}

build {
  sources = ["source.docker.example"]
  post-processors {
    post-processor "docker-tag" {
      repository = var.repository
      tags       = [var.tag]
    }
  }
}
