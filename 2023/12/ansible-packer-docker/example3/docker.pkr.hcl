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
      "apt install -y python3 python3-pip sudo init systemd ca-certificates",
      # https://www.task4233.dev/article/20220613.html
      "python3 -m pip install pathlib"
    ]
  }
  provisioner "ansible" {
    user             = "root"
    playbook_file    = "example3/ansible/playbook.yml"
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
