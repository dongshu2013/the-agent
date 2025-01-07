from typing import Dict


# flake8: noqa
# fmt: off
class MessageValidator:
    MAX_MESSAGE_LENGTH = 2000  # characters

    @classmethod
    def validate_message(cls, message: str) -> Dict[str, bool | str]:
        if len(message) > cls.MAX_MESSAGE_LENGTH:
            return {  # noqa: E501
                "valid": False,
                "error": "Oops! That message is a bit too long for me to digest. Could you break it down into smaller chunks? 😊",
            }

        if len(message.strip()) == 0:
            return {  # noqa: E501
                "valid": False,
                "error": "Hey there! I noticed you sent an empty message. Feel free to type something and I'll be happy to help! 💭",
            }

        return {"valid": True, "error": None}
