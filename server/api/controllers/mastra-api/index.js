'use strict';

const HELPER_BASE = process.env.HELPER_BASE || "/opt/";
const Response = require(HELPER_BASE + 'response');
const Redirect = require(HELPER_BASE + 'redirect');

const MASTRA_URL = "http://localhost:4111";
const API_KEY = "12345678";

const Mastra = require("@mastra/client-js");
 
const client = new Mastra.MastraClient({
  baseUrl: MASTRA_URL,
});

(async () =>{
	const agents = await client.getAgents();
	console.log(agents);
})();

const agent = client.getAgent("chatAgent");

exports.handler = async (event, context, callback) => {
	var body = JSON.parse(event.body);
	console.log(body);

	var apikey = event.requestContext.apikeyAuth?.apikey;
	if( apikey != API_KEY )
		throw new Error("invalid apikey");
		
	const response = await agent.generate({
		messages: [
			{
				role: "user",
				content: body.message,
			},
		],
	});
	console.log(response);

	return new Response({ message: response.text });
};
