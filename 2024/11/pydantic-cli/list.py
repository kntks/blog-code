from pydantic_settings import CliApp, BaseSettings


class Settings(BaseSettings):
    my_list: list[str]

    def cli_cmd(self) -> None:
        print(f"List: {self.my_list}")


if __name__ == "__main__":
    CliApp.run(Settings)
