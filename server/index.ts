import { State } from "../client/state/state";
import { Registry } from "../shared/levelset/registry";
import { Server } from "./netcode/server";

State.levelsetRegistry = new Registry();

new Server();
