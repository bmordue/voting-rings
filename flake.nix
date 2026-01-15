{
  description = "Development environment for voting rings project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ ];
        };
        
        # Node.js packages that match the project requirements
        nodePackages = with pkgs; [
          nodejs-18_x
          npm
          yarn
          pnpm
        ];
        
        # Development tools
        devTools = with pkgs; [
          git
          curl
          jq
          gnumake
          pkg-config
          gcc
        ];
        
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = nodePackages ++ devTools;

          # Environment variables
          NODE_ENV = "development";
          
          # Setup hook to install dependencies and show welcome message
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
            echo "Available commands:"
            echo "  npm run dev          - Start development server"
            echo "  npm run build        - Build the project"
            echo "  npm run test         - Run tests in watch mode"
            echo "  npm run test:run     - Run tests once"
            echo "  npm run lint         - Lint the code"
            echo "  npm run preview      - Preview production build"
            echo "  npm run coverage     - Generate coverage report"
            echo ""
          };
        };
      });
}