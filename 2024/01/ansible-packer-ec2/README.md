## ansible-packer-ami







```sh
$ ansible-galaxy collection install community.aws -p ./ansible/.collections
$ ansible-galaxy collection list --collection-path ./ansible/.collections
```

AWS Systems Manager の Ansible Playbook 実行機能を利用したパッチ適用
https://sid-fm.com/blog/archive/entry/20210629.html
https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/systems-manager-state-manager-ansible.html


以下の記事のように、ローカル環境からセッションマネージャー経由でSSHを実行する方法は個人で検証するには問題なさそうです。  

## 個人で利用する方法

参考：
