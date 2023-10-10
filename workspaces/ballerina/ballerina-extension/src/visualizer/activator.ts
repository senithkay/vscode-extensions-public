
import { createMachine, assign } from 'xstate';

const textMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QDUCWsCuBDANqgXmAE4B0RYWEAngMQD2ADmAHbICSYA7gNoAMAuolAM6sVABdUdZkJAAPRAGYAbACYSqgBzKALDtUB2AJyrV+wwBoQVRAFoAjLxLLeO+0b0BWHQccn7AL4BVmiYuATEJGhcAIIAxpIAbmAkiahcbMwSNADqAKIAQux5OQD6AEp5AHIAInnlfIJIICJiktKyCgj2mjokOh6avgY+jgbeVjYIhooknmpq9i6evK6aQSHo2HiEpKhZ4jQA8lWlADIAyhV5MTUAmo2yrRJSMs1d9lokvI6KBq4mIyeTyWax2TTqUxGdyqFZ-RQQ1QbEChbYRUjRTjxJIpNJcM50SiQY6nSq1ep5GqPZrPdpvUBdP5OUyKIzKTSaTyaaF6SaIHTKTwkAyqIx-ZSKT7KDzKZGo8K7KLpLEJVDJVLKglEiAk0r1cpHBoCJ6iF4dd6IewGTQkRTeWFWxSqdyeew6PkINwGW1s3jKN2OVa9RRyrYKyKY7FqsA0ADCZyOFzy1OEprpnUQXL6QMUvAhijchiBHocThcbl60OMygMCNDYR2EeVUeS9CYrGVKZaadeGYQKnUrL9YwLLjzHudQqhqjznhGXN8nnraMVkdV6rxnHKxBYEGIurJdUqVONNJ75oZiBrQr01v8Bhc43dYM9c7mnklOldn14ovWwRRMNGwxZt1xjAAxNgzjyUpYwACRiKoAHFKS7WlewtBBlF0Eg2UcHReGBEVrQMD13D6eZYVdVR-SGRQnSCADmDoPd4GaeVgJNNoMMvBBbC-XDuQlO1RlWaESytMsv20QwiP9X9l3DUhyEoKZU24i95CUbDbU8MUXG5K02QmF9bE0WYfGhMUaP9IwjH-TYG3RJVYjArizXpLTuicAYdG0Ax-n+V0EWfKYxh9LlNCtEVJWdRTgJclUcQ1DIDnc9NMK5fpBhrQLCPsEKJ1rOYFmdZZVj8+LnLXZLNy1PcIHSnivJUG1fKGfQIVcAVFA9As+mnTQ83sgqISqxV9gkJrNK6dQfl4FRdBBbkjF4EwS3M-pjHcJ1sPcezxqbVzauVbdmD3chGrPDTPK6bwbRZIxfHsSifl6l8Vm9EUTA-EEPBowjDpA47oxSzg8iIIg6CIabbstTlnAI-5VoheYHw9T7hVFWE7VFfRliBxKW1xU6d3O4hYb7P7nACt6nUGcSXxo+xcOlB8aK0bljEYgIgA */
    context: {
        committedValue: '',
        value: '',
    },

    initial: 'init',

    states: {
        ready: {
            on: {
                openVIew: "ViewActive"
            }
        },

        ViewActive: {
            states: {
                viewInit: {
                    on: {
                        WEBVIEW_RENDER: "viewLoaded"
                    }
                },

                viewLoaded: {
                    on: {
                        ON_RENDERED: "viewRendered",
                        ON_ERROR: "viewError"
                    }
                },

                viewRendered: {},
                viewError: {},
                viewRerender: {
                    on: {
                        ON_RENDERED: "viewRendered"
                    }
                }
            },

            initial: "viewInit",

            on: {
                CLOSE: "ready",
                openView: ".viewRerender",
                FILE_CHANGED: ".viewRerender"
            }
        },

        init: {
            on: {
                ON_LS_READY: "ready"
            }
        }
    },

    id: "Visualizer"
})