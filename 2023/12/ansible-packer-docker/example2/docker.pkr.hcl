source "docker" "example" {
  image  = var.image
  commit = true
  changes = [
    "LABEL build=packer"
  ]
  run_command = ["-d", "-i", "-t", "--", "{{.Image}}"]
  privileged  = true
}

build {
  sources = ["source.docker.example"]

  provisioner "shell" {
    inline = [
      "apt update",
      "apt install -y python3 sudo init systemd"
    ]
  }
  provisioner "ansible" {
    user             = "root"
    playbook_file    = "example2/ansible/playbook.yml"
    ansible_env_vars = ["ANSIBLE_CONFIG=ansible/ansible.cfg"]

    extra_arguments = [
      "--scp-extra-args",
      "'-O'"
    ]
  }

  post-processors {
    post-processor "docker-tag" {
      repository = var.repository
      tags       = [var.tag]
    }
  }
}
