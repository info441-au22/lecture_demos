import chai from 'chai'
let assert = chai.assert
import request from 'supertest'

// I want to do an integration test on items, making
// sure it connects to mongodb correctly

// for that, I need to import app.js to have it load the models and item router
import app from '../app.js'

describe('Items integration test (with database)', () => {
    before(async function() {
        // pause to make sure the database is connected before the test starts
        return await new Promise(resolve => setTimeout(resolve, 4000))
    })

    it('should get items from the db for a GET items request', async () => {
        const res = await request(app).get('/items')

        assert.equal(res.statusCode, 200)
        assert.equal(res.type, "application/json")

        assert.isArray(res.body)
        assert.include(
            res.body[0],
            {
                name: 'orange',
                price: 0.75
            }
        )
    })
})