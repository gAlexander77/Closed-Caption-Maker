import os

def initialize_directory(folder="../in-out"):
    try:
        folder_path = os.path.abspath(folder)
        print(f"[Server]: Looking for \"{folder}\"...")

        if not os.path.exists(folder_path):
            print(f"[Server]: Could not find \"{folder}\"")
            print(f"[Server]: Creating \"{folder}\"...")
            os.makedirs(folder_path)
            print(f"[Server]: Successfully created \"{folder}\"")
        else:
            print(f"[Server]: Found \"{folder}\"")
            print(f"[Server]: Skipping initialization")
            
    except Exception as e:
        print(f"[Server]: An error occurred: {e}")