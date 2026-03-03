let app = new Vue({
    el: '#app',
    data: {
        columns: [
            { id: 1, title: "To Do (max 3)", limit: 3 },
            { id: 2, title: "In Progress (max 5)", limit: 5 },
            { id: 3, title: "Done (unlimited)", limit: null }
        ]
    }
})