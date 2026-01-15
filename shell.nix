{ pkgs ? import <nixpkgs> {} }:

let
  nodejs = pkgs.nodejs_24;
in
pkgs.mkShell {
  buildInputs = with pkgs; [
    # Node.js and package manager
    nodejs

    # Development tools
    git
    curl
    jq

    # For building native dependencies
    glibcLocales
    pkg-config
    gcc

    # Additional tools that might be needed
    coreutils
  ];

  # Set environment variables
  NODE_ENV = "development";
  PROJECT_ROOT = toString ./.;  # Set the project root

  # Install dependencies using npm
  shellHook = ''
    # Set locale to prevent potential issues with Node.js
    export LC_ALL="C.UTF-8";

    # Check if node_modules exists, if not install dependencies
    if [ ! -d "node_modules" ]; then
      echo "Installing dependencies..."
      npm install
    fi

    # Welcome message
    echo "==========================================="
    echo "  Welcome to the Voting Rings Dev Shell!"
    echo "==========================================="
    echo ""
    echo "Project: voting-rings (Spark Template)"
    echo "Node.js: $(node --version)"
    echo "NPM: $(npm --version)"
    echo ""
    echo "Available commands:"
    echo "  npm run dev          - Start development server"
    echo "  npm run build        - Build the project"
    echo "  npm run test         - Run tests in watch mode"
    echo "  npm run test:run     - Run tests once"
    echo "  npm run lint         - Lint the code"
    echo "  npm run preview      - Preview production build"
    echo "  npm run coverage     - Generate coverage report"
    echo "  npm run optimize     - Pre-bundle dependencies"
    echo ""
    echo "Happy coding! 🚀"
    echo ""
  '';
}
