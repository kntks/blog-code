# MacでNICE DCVサーバをローカル環境で起動するには？


## lima 準備

### mise
```sh
$ mise plugins install lima
$ mise ls-remote lima
# 最新をインストール
$ mise install lima 0.19.0
$ mise global lima 0.19.0
```

### homebrew

```sh
$ brew install lima
```

## Ansible 準備
```sh
$ mise plugins install ansible-base
$ mise install ansible-base 2.10.17
$ mise local ansible-base 2.10.17
```

## limaで立ち上げたVMにAnsibleを実行してみる

エラーが出る場合は、一度stop & startすればうまく起動する
```sh
$ limactl start --name qemu-ubuntu --tty=false qemu-ubuntu.yaml

# 一度stopしても一度起動する
$ limactl stop qemu-ubuntu
$ limactl start --name qemu-ubuntu
```

`limactl ls`コマンドでSSHのポートやcpuのアーキテクチャを調べることができます。shellを開始して、`uname`コマンドで確認もできます。
```sh
$ limactl ls qemu-ubuntu
NAME           STATUS     SSH                VMTYPE    ARCH      CPUS    MEMORY    DISK     DIR
qemu-ubuntu    Running    127.0.0.1:50022    qemu      x86_64    4       4GiB      20GiB    ~/.lima/qemu-ubuntu

$ limactl shell qemu-ubuntu
$ PS1="${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\h\[\033[00m\]:\[\033[01;34m\]\W\[\033[00m\] $ "
$ uname -m
x86_64
```

```sh
---
- hosts: all
  become: true
  gather_facts: false

  tasks:
    - name: shell
      ansible.builtin.shell: uname -a
      register: uname_result
    
    - name: output result
      ansible.builtin.debug:
        var: uname_result.stdout
```

`qemu-ubuntu.yaml`ファイルでssh.localPortを`50022`にしました。Ansibleでplaybookを実行するときにはそのportをオプションで指定します。

```sh
$ ansible-playbook playbook.yml -i localhost, --ssh-extra-args '-p 50022'

PLAY [all] ****************************************************************************************************************************

TASK [shell] **************************************************************************************************************************
changed: [localhost]

TASK [output result] ******************************************************************************************************************
ok: [localhost] => {
    "uname_result.stdout": "Linux lima-qemu-ubuntu 5.15.0-57-generic #63-Ubuntu SMP Thu Nov 24 13:43:17 UTC 2022 x86_64 x86_64 x86_64 GNU/Linux"
}

PLAY RECAP ****************************************************************************************************************************
localhost                  : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

出力結果に `Linux`、`x86_64`と書かれているので、VMでansibleを実行できていることが確認できます。

## NICE DCV をインストールする
一度VMを止めて、再度起動します。
```sh
$ limactl stop qemu-ubuntu
$ limactl start qemu-ubuntu
```

VM に対してshellを実行します
```sh
$ limactl shell qemu-ubuntu 

$ systemctl status dcvserver
● dcvserver.service - NICE DCV server daemon
     Loaded: loaded (/lib/systemd/system/dcvserver.service; enabled; vendor preset: enabled)
     Active: active (running) since Thu 2024-01-18 13:27:40 UTC; 2min 3s ago
   Main PID: 1440 (dcvserver)
      Tasks: 7 (limit: 4634)
     Memory: 35.8M
        CPU: 1.963s
     CGroup: /system.slice/dcvserver.service
             ├─1440 /bin/bash /usr/bin/dcvserver -d --service
             └─1462 /usr/lib/x86_64-linux-gnu/dcv/dcvserver --service
```

DCVサーバが起動したタイミングで本来はセッションが作成されますが、LimaのVMで起動した場合はセッションが作成されません。(原因はわかっていません。)
```sh
$ cat /etc/dcv/dcv.conf | grep create-session
create-session # ← DCVが起動すると自動的にセッションを作成する

$ dcv list-sessions
There are no sessions available.
```

セッションが存在しないので、dcvコマンドで作成します。
```sh
$ sudo dcv create-session --type console --owner ubuntu console

$ dcv list-sessions
Session: 'console' (owner:ubuntu type:console)
```

`https://localhost:8443/#console` にアクセスします。

### 時間を計測

ubuntu-desktopをダウンロードする場合のplaybook全体の実行時間は30分37秒かかります。
```sh
$ time ansible-playbook -i localhost, ansible/playbook.yml --ssh-extra-args '-p 50022'

ansible-playbook -i localhost, ansible/playbook.yml --ssh-extra-args   33.85s user 5.87s system 2% cpu 30:37.61 total
```


## 片付け

```sh
$ limactl stop qemu-ubuntu
$ limactl delete qemu-ubuntu
```

参考：
- [SSH のポート番号を変更したサーバーに対して Ansible を実行する - Qiita](https://qiita.com/tanaka-qtaro/items/01ca3d06de783901f1b4)
- []()

## 


## トラブルシュート

### crypt.crypt not supported on Mac OS X/Darwin, install passlib python module

```sh
fatal: [localhost]: FAILED! => {"msg": "crypt.crypt not supported on Mac OS X/Darwin, install passlib python module"}
```

miseを使っている場合、pythonの場所が違う
```sh
$  ~/.local/share/mise/installs/ansible-base/2.10.17/venv/bin/python3 -m pip list
```

### The connection has been closed. The sessionId console is not available

`https://localhost:8443/#console`にアクセスした後、ubuntuユーザでログインしたところ出たエラー

vm側で実行する
```sh
$ dcv list-sessions
Session: '0' (owner:ubuntu type:console)

$ dcv describe-session 0 --json
{
  "id" : "0",
  "owner" : "ubuntu",
  "user" : "dcv",
  "num-of-connections" : 0,
  "creation-time" : "2024-01-14T12:15:09.707728Z",
  "last-disconnection-time" : "",
  "licenses" : [
    {
      "product" : "dcv",
      "status" : "licensed",
      "check-timestamp" : "2024-01-14T14:15:10.048734Z",
      "expiration-date" : "2024-02-13T00:00:00Z"
    }
  ],
  "licensing-mode" : "demo",
  "storage-root" : "",
  "type" : "console",
  "status" : "created",
  "x11-display" : "",
  "x11-authority" : ""
}
```

## メモ
```
sudo dcv create-session --type console --owner ubuntu console
```