import { createHashRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { LobbyPage } from "./pages/LobbyPage";
import { RoomPage } from "./pages/RoomPage";
import { GamePage } from "./pages/GamePage";

export const router = createHashRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/lobby",
    Component: LobbyPage,
  },
  {
    path: "/room/:roomCode",
    Component: RoomPage,
  },
  {
    path: "/game/:roomCode",
    Component: GamePage, 
  },
  {
    path: "/game/:roomCode/play", 
    Component: RoomPage, 
  },
]);