
# terraform 

```sh
$ terraform plan
$ terraform apply -auto-approve

# ec2のinstance idを確認する
$ aws ec2 describe-instances --filter "Name=tag:Name,Values=ubuntu-ec2" --query "Reservations[].Instances[].InstanceId"
```
