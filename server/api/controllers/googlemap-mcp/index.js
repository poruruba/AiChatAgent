'use strict';

const GOOGLEMAP_API_KEY = process.env.GOOGLEMAP_API_KEY || "YOUR_GOOGLEMAP_API_KEY";

const { McpServer, ResourceTemplate } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { z } = require("zod");

exports.handler = () => {
    const server = new McpServer({
        name: "mcp-server/google-maps",
        version: "0.1.0"
    });

    server.tool("maps_geocode", "Convert an address into geographic coordinate",
        { address: z.string().describe("The address to geocode") },
        async (args) => {
          try{
            console.log(args);
            var input = {
              url: "https://maps.googleapis.com/maps/api/geocode/json",
              qs: {
                address: args.address,
                key: GOOGLEMAP_API_KEY,
                language: "ja"
              }
            };
            var result = await do_http(input);
            console.log(result);
            if( result.status != 'OK' )
              throw new Error("status is not OK");

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    location: result.results[0].geometry.location,
                    formatted_address: result.results[0].formatted_address,
                    place_id: result.results[0].place_id
                  }, null, 2)
                }
              ],
            }
          }catch(error){
            console.error(error);
            return {
              content: [{
                type: "text",
                text: `Error: ${error}`
              }],
              isError: true
            };
          }
        }
    );

    server.tool("maps_reverse_geocode", "Convert coordinates into an address",
        { latitude: z.number().describe("latitude"), longitude: z.number().describe("longitude") },
        async (args) => {
          try{
            console.log(args);
            var input = {
              url: "https://maps.googleapis.com/maps/api/geocode/json",
              qs: {
                latlng: `${args.latitude},${args.longitude}`,
                key: GOOGLEMAP_API_KEY,
                language: "ja"
              }
            };
            var result = await do_http(input);
            console.log(result);
            if( result.status != 'OK' )
              throw new Error("status is not OK");

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    formatted_address: result.results[0].formatted_address,
                    place_id: result.results[0].place_id,
                    address_components: result.results[0].address_components
                  }, null, 2)
                }
              ],
            }
          }catch(error){
            console.error(error);
            return {
              content: [{
                type: "text",
                text: `Error: ${error}`
              }],
              isError: true
            };
          }
        }
    );

    server.tool("maps_search_places", "Search for places using Google Places API",
        {
          query: z.string().describe("Search query"),
          location: z.object({ latitude: z.number().describe("latitude"), longitude: z.number().describe("longitude")}).describe("Optional center point for the search").optional(),
          radius: z.number().describe("Search radius in meters (max 50000)").optional()
        },
        async (args) => {
          try{
            console.log(args);
            var input = {
              url: "https://maps.googleapis.com/maps/api/place/textsearch/json",
              qs: {
                query: args.query,
                key: GOOGLEMAP_API_KEY,
                language: "ja"
              }
            };
            if( args.location )
              input.qs.location = `${args.location.latitude},${args.location.longitude}`;
            if( args.radius)
              input.qs.radius = args.radius;
            var result = await do_http(input);
            console.log(result);
            if( result.status != 'OK' )
              throw new Error("status is not OK");

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    places: result.results.map((place) => ({
                      name: place.name,
                      formatted_address: place.formatted_address,
                      location: place.geometry.location,
                      place_id: place.place_id,
                      rating: place.rating,
                      types: place.types
                    }))
                  }, null, 2)
                }
              ],
            }
          }catch(error){
            console.error(error);
            return {
              content: [{
                type: "text",
                text: `Error: ${error}`
              }],
              isError: true
            };
          }
        }
    );

    server.tool("maps_place_details", "Get detailed information about a specific place",
        { place_id: z.string().describe("The place ID to get details for") },
        async (args) => {
          try{
            console.log(args);
            var input = {
              url: "https://maps.googleapis.com/maps/api/place/details/json",
              qs: {
                place_id: args.place_id,
                key: GOOGLEMAP_API_KEY,
                language: "ja"
              }
            };
            var result = await do_http(input);
            console.log(result);
            if( result.status != 'OK' )
              throw new Error("status is not OK");

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    name: result.result.name,
                    formatted_address: result.result.formatted_address,
                    location: result.result.geometry.location,
                    formatted_phone_number: result.result.formatted_phone_number,
                    website: result.result.website,
                    rating: result.result.rating,
                    reviews: result.result.reviews,
                    opening_hours: result.result.opening_hours
                  }, null, 2)
                }
              ],
            }
          }catch(error){
            console.error(error);
            return {
              content: [{
                type: "text",
                text: `Error: ${error}`
              }],
              isError: true
            };
          }
        }
    );

    server.tool("maps_distance_matrix", "Calculate travel distance and time for multiple origins and destinations",
        {
          origins: z.array(z.string()).describe("Array of origin addresses or coordinates"),
          destinations: z.array(z.string()).describe("Array of destination addresses or coordinates"),
          mode: z.enum(["driving", "walking", "bicycling", "transit"]).describe("Travel mode (driving, walking, bicycling, transit)").default("driving")
        },
        async (args) => {
          try{
            console.log(args);
            var input = {
              url: "https://maps.googleapis.com/maps/api/distancematrix/json",
              qs: {
                origins: args.origins.join("|"),
                destinations: args.destinations.join("|"),
                mode: args.mode,
                key: GOOGLEMAP_API_KEY,
                language: "ja"
              }
            };
            var result = await do_http(input);
            console.log(result);
            if( result.status != 'OK' )
              throw new Error("status is not OK");

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    origin_addresses: result.origin_addresses,
                    destination_addresses: result.destination_addresses,
                    results: result.rows.map((row) => ({
                      elements: row.elements.map((element) => ({
                        status: element.status,
                        duration: element.duration,
                        distance: element.distance
                      }))
                    }))
                  }, null, 2)
                }
              ],
            }
          }catch(error){
            console.error(error);
            return {
              content: [{
                type: "text",
                text: `Error: ${error}`
              }],
              isError: true
            };
          }
        }
    );

    server.tool("maps_elevation", "Get elevation data for locations on the earth",
        {
          locations: z.array(z.object({ latitude: z.number().describe("latitude"), longitude: z.number().describe("longitude") })).describe("Array of locations to get elevation for")
        },
        async (args) => {
          try{
            console.log(args);
            const locationString = args.locations
              .map((loc) => `${loc.latitude},${loc.longitude}`)
              .join("|");
            var input = {
              url: "https://maps.googleapis.com/maps/api/elevation/json",
              qs: {
                locations: locationString,
                key: GOOGLEMAP_API_KEY,
                language: "ja"
              }
            };
            var result = await do_http(input);
            console.log(result);
            if( result.status != 'OK' )
              throw new Error("status is not OK");

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    results: result.results.map((result) => ({
                      elevation: result.elevation,
                      location: result.location,
                      resolution: result.resolution
                    }))
                  }, null, 2)
                }
              ],
            }
          }catch(error){
            console.error(error);
            return {
              content: [{
                type: "text",
                text: `Error: ${error}`
              }],
              isError: true
            };
          }
        }
    );
    
    return server;
};

// input: url, method, headers, qs, body, params, response_type, content_type, token, api_key
async function do_http(input){
  const method = input.method ? input.method : "POST";
  const content_type = input.content_type ? input.content_type : "application/json";
  const response_type = input.response_type ? input.response_type : "json";

  const headers = new Headers();
  if( input.headers ){
    for( const key of Object.keys(input.headers))
      headers.append(key, input.headers[key]);
  }

  if( content_type != "multipart/form-data" )
    headers.append("Content-Type", content_type);
  if( input.token )
    headers.append("Authorization", "Bearer " + input.token);
  if( input.api_key )
    headers.append("x-api-key", input.api_key);

  let body;
  if( content_type == "application/json" ){
    body = JSON.stringify(input.body);
  }else if( content_type == "application/x-www-form-urlencoded"){
    body = new URLSearchParams(input.params);
  }else if( content_type == "multipart/form-data"){
    body = Object.entries(input.params).reduce((l, [k, v]) => { l.append(k, v); return l; }, new FormData());
  }else{
    body = input.body;
  }

  const params = new URLSearchParams(input.qs);
  var params_str = params.toString();
  var postfix = (params_str == "") ? "" : ((input.url.indexOf('?') >= 0) ? ('&' + params_str) : ('?' + params_str));

  return fetch(input.url + postfix, {
    method: method,
    body: body,
    headers: headers,
    cache: "no-store"
  })
  .then((response) => {
    if (!response.ok)
      throw new Error('status is not 200');

    if( response_type == "raw" )
      return response;
    else if( response_type == "json" )
      return response.json();
    else if( response_type == 'blob')
      return response.blob();
    else if( response_type == 'file'){
      const disposition = response.headers.get('Content-Disposition');
      let filename = "";
      if( disposition ){
        filename = disposition.split(/;(.+)/)[1].split(/=(.+)/)[1];
        if (filename.toLowerCase().startsWith("utf-8''"))
            filename = decodeURIComponent(filename.replace(/utf-8''/i, ''));
        else
            filename = filename.replace(/['"]/g, '');
      }
      return response.blob()
      .then(blob =>{
        return new File([blob], filename, { type: blob.type })      
      });
    }
    else if( response_type == 'binary')
      return response.arrayBuffer();
    else // response_type == "text"
      return response.text();
  });
}
