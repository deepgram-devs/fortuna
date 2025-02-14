import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { ConfigComponent } from "./config/config.component";
import { AgentComponent } from "./agent/agent.component";

export const routes: Routes = [
  { path: "", pathMatch: "full", component: HomeComponent },
  { path: "config", component: ConfigComponent },
  { path: "agent", component: AgentComponent }
];
