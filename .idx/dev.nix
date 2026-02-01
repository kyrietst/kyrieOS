{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.virtualenv
    pkgs.powershell
  ];
  env = {};
  idx = {
    extensions = [
      "bradlc.vscode-tailwindcss"
      "esbenp.prettier-vscode"
    ];
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev:frontend" "--" "-H" "0.0.0.0"];
          manager = "web";
          env = {
            PORT = "3000";
          };
        };
      };
    };
    workspace = {
      onCreate = {
        npm-install = "npm install";
        venv-create = "python3 -m venv venv";
        pip-install = "source venv/bin/activate && pip install -r api/requirements.txt";
      };
      onStart = {
        # Optional: Start backend in a terminal or let user do it
      };
    };
  };
}


