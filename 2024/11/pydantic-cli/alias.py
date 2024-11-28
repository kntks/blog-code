from pydantic import AliasChoices, AliasPath, Field
from pydantic_settings import CliApp, BaseSettings


class User(BaseSettings):
    first_name: str = Field(
        validation_alias=AliasChoices("f", "fname", AliasPath("name", 0))
    )
    last_name: str = Field(
        validation_alias=AliasChoices("l", "lname", AliasPath("name", 1))
    )

    def cli_cmd(self) -> None:
        print(f"First name: {self.first_name}")
        print(f"Last name: {self.last_name}")


if __name__ == "__main__":
    CliApp.run(User)
