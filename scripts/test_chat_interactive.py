import requests

BASE_URL = "http://localhost:8000"


def interactive_chat():
    # Test user details
    test_user_id = "12345"

    print("Starting chat session (type 'quit' to exit)")
    print("-" * 50)

    while True:
        # Get user input
        user_message = input("\nYou: ")

        if user_message.lower() == "quit":
            break

        # Prepare the chat request
        chat_data = {
            "messages": [user_message],
        }

        try:
            # Send chat request
            response = requests.post(f"{BASE_URL}/chat/{test_user_id}", json=chat_data)
            response.raise_for_status()

            # Print the response
            result = response.json()
            assistant_message = result["choices"][0]["message"]["content"]
            print("\nAssistant:", assistant_message)

        except requests.RequestException as e:
            print(f"Error occurred: {e}")


if __name__ == "__main__":
    interactive_chat()
