from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    llm_api_key: str = ""
    llm_base_url: str = "https://api.stepfun.com/step_plan/v1"
    llm_model: str = "step-3.7-flash"
    llm_timeout: int = 60


settings = Settings()
