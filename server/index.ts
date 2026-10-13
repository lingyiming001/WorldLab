import {agentRoute,type AgentEnv} from './agent';
export default {async fetch(request:Request,env:AgentEnv){return agentRoute(request,env)}};
