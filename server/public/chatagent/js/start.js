'use strict';

//const vConsole = new VConsole();
//const remoteConsole = new RemoteConsole("http://[remote server]/logio-post");
//window.datgui = new dat.GUI();

const base_url = "";

var vue_options = {
    el: "#top",
    mixins: [mixins_bootstrap],
    store: vue_store,
    router: vue_router,
    data: {
        message_list: [],
        input_message: "",
        input_apikey: "",
    },
    computed: {
    },
    methods: {
        apikey_config_open: function(){
            this.input_apikey = this.apikey;
            this.dialog_open("#apikey_config_dialog");
        },
        apikey_config_save: function(){
            localStorage.setItem("chatagent_apikey", this.input_apikey);
            this.apikey = this.input_apikey;
            this.dialog_close("#apikey_config_dialog");
        },

        send_message: async function(){
            var message = {
                input: this.input_message,
                inProgress: true,
            };
            try{
                this.message_list.push(message);

                var input = {
                    url: base_url + "/mastra-generate",
                    body: {
                        message: message.input
                    },
                    api_key: this.apikey
                };
                var response = await do_http(input);
                console.log(response);

                message.output = response.message;
                this.input_message = "";
            }catch(error){
                console.error(error);
                alert(error);
            }finally{
                message.inProgress = false;
            }
        }
    },
    created: function(){
    },
    mounted: function(){
        proc_load();

        this.apikey = localStorage.getItem("chatagent_apikey");
    }
};
vue_add_data(vue_options, { progress_title: '' }); // for progress-dialog
vue_add_global_components(components_bootstrap);
vue_add_global_components(components_utils);

/* add additional components */
  
window.vue = new Vue( vue_options );
