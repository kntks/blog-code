variable "image" {
  type        = string
  default     = "ubuntu:22.04"
  description = "source image"
}

variable "repository" {
  type    = string
  default = null
}

variable "tag" {
  type        = string
  default     = "0.1"
  description = "build tag"
}