from pydantic.dataclasses import dataclass

from pydantic_settings import BaseSettings, CliPositionalArg, CliSubCommand, CliApp


@dataclass
class Init:
    directory: CliPositionalArg[str]

    def cli_cmd(self) -> None:
        print(f'git init "{self.directory}"')
        self.directory = "ran the git init cli cmd"


@dataclass
class Clone:
    repository: CliPositionalArg[str]
    directory: CliPositionalArg[str]

    def cli_cmd(self) -> None:
        print(f'git clone from "{self.repository}" into "{self.directory}"')
        self.directory = "ran the clone cli cmd"


class Git(BaseSettings):
    clone: CliSubCommand[Clone]
    init: CliSubCommand[Init]

    def cli_cmd(self) -> None:
        CliApp.run_subcommand(self)


if __name__ == "__main__":
    CliApp.run(Git)
