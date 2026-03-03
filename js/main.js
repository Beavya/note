Vue.component('note-card', {
    props: {
        card: {
            type: Object,
            required: true
        }
    },
    template: `
        <div class="note-card">
            <h3>{{ card.title }}</h3>
            <ul>
                <li v-for="item in card.items">{{ item.text }}</li>
            </ul>
        </div>
    `
})

Vue.component('column', {
    props: {
        column: {
            type: Object,
            required: true
        },
        cards: {
            type: Array,
            required: true
        }
    },
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <div class="cards-container">
                <note-card 
                    v-for="card in filteredCards" 
                    :key="card.id"
                    :card="card"
                ></note-card>
            </div>
        </div>
    `,
    computed: {
        filteredCards() {
            return this.cards.filter(card => card.columnId === this.column.id)
        }
    }
})

let app = new Vue({
    el: '#app',
    data: {
        columns: [
            { id: 1, title: 'To Do (max 3)', limit: 3 },
            { id: 2, title: 'In Progress (max 5)', limit: 5 },
            { id: 3, title: 'Done (unlimited)', limit: null }
        ],
        cards: [
            {
                id: 1,
                title: 'Shopping List',
                columnId: 1,
                items: [
                    { text: 'Buy milk', completed: false },
                    { text: 'Buy bread', completed: false },
                    { text: 'Buy eggs', completed: false }
                ]
            },
            {
                id: 2,
                title: 'Work Tasks',
                columnId: 1,
                items: [
                    { text: 'Write report', completed: false },
                    { text: 'Call client', completed: false },
                    { text: 'Team meeting', completed: false }
                ]
            },
            {
                id: 3,
                title: 'Reading List',
                columnId: 2,
                items: [
                    { text: 'Read Vue docs', completed: false },
                    { text: 'Read JavaScript book', completed: false },
                    { text: 'Read article', completed: false }
                ]
            }
        ]
    }
})