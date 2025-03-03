# Uni Pi Games PlatformCore Requirements

## Scalable Architecture
- **Monorepo Structure:**
  - Frontend: React (Next.js)
  - Backend: Node.js (Express)
  - Games: Plugins directory (React components)
- **Docker Orchestration:**
  - Use Docker Compose for local development
  - Designed for Kubernetes-ready scaling with Helm charts
- **Load Balancing:**
  - Incorporate Nginx reverse proxy for future horizontal scaling

## Pi SDK Integration
- **Authentication:**
  - Use Pi SDK with OAuth2 flow for user authentication
  - Request wallet with deposit/withdraw scopes
- **Security:**
  - JWT token storage in Redis (short-lived)
  - Use refresh tokens for session management

## React Frontend
- **Floating Pi Animation:**
  - Use react-three-fiber for WebGL-based floating/bouncing Pi symbols (with no scroll overflow)
- **Responsive UI:**
  - Tailwind CSS for grid layouts
  - Collapsible sidebar on mobile devices
- **User Menu:**
  - Profile icon dropdown (top-right) with options:
    - Deposit (opens Pi Wallet modal)
    - Withdraw (triggers Redis queue)
    - Settings, Sign Out

## Game Modularity
- **Plugin System:**
  - Games are React components stored in the `/plugins/games` directory
- **API Contracts:**
  - Each game must implement the following interface:

