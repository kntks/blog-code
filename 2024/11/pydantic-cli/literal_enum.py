from enum import IntEnum
from typing import Literal

from pydantic_settings import CliApp, BaseSettings


class Fruit(IntEnum):
    pear = 0
    kiwi = 1
    lime = 2


class Settings(BaseSettings):
    fruit: Fruit
    pet: Literal["dog", "cat", "bird"]

    def cli_cmd(self) -> None:
        print(f"Fruit: {self.fruit.name}")
        print(f"Pet: {self.pet}")


CliApp.run(Settings)
