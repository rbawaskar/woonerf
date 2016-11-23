/* globals describe, expect, it, jasmine */

import isObject from 'lodash.isobject'
import nock from 'nock'

import fetch, {fetchMultiple} from '../../src/fetch'
import createStore from '../../src/store'

const store = createStore()

jasmine.DEFAULT_TIMEOUT_INTERVAL *= 5

describe('fetch', () => {
  it('should dispatch a fetch action and call next', (done) => {
    nock('http://google.com')
      .get('/')
      .reply(200, {})

    const action = fetch({
      url: 'http://google.com',
      next: done
    })
    store.dispatch(action)
  })

  it('should automatically parse json responses', (done) => {
    nock('http://google.com')
      .get('/')
      .reply(200, {})

    const action = fetch({
      url: 'https://autocomplete.clearbit.com/v1/companies/suggest?query=stripe',
      options: {
        headers: {
          'Accept': 'application/json'
        }
      },
      next: (error, response) => {
        expect(isObject(response.value)).toBeTruthy()
        done(error)
      }
    })
    store.dispatch(action)
  })

  it('should fetch multiple urls in one go', (done) => {
    nock('http://conveyal.com')
      .get('/one')
      .reply(200, 'one')

    nock('http://conveyal.com')
      .get('/two')
      .reply(200, 'two')

    const action = fetchMultiple({
      fetches: [{
        url: 'http://conveyal.com/one'
      }, {
        url: 'http://conveyal.com/two'
      }],
      next: (error, responses) => {
        expect(responses.length).toBe(2)
        expect(responses[0].value).toBe('one')
        expect(responses[1].value).toBe('two')
        done(error)
      }
    })

    store.dispatch(action)
  })
})
