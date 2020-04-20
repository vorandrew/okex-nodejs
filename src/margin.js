import Got from 'got'
import crypto from 'crypto'
import qs from 'querystring'

export default class Margin {
  constructor(key, secret, pass) {
    this.secret = secret
    this.got = Got.extend({
      prefixUrl: 'https://www.okex.com/api/margin/v3',
      headers: {
        'OK-ACCESS-KEY': key,
        'OK-ACCESS-PASSPHRASE': pass,
      },
    })
  }

  public(endpoint, searchParams) {
    return this.got.get(endpoint, { searchParams }).json()
  }

  private(endpoint, params, method = 'GET') {
    const ts = Date.now() / 1000
    let sign

    if (method === 'GET') {
      sign = params
        ? `${ts}${method}/api/margin/v3/${endpoint}?` + qs.encode(params)
        : `${ts}${method}/api/margin/v3/${endpoint}`
    } else {
      sign = params
        ? `${ts}${method}/api/margin/v3/${endpoint}` + JSON.stringify(params)
        : `${ts}${method}/api/margin/v3/${endpoint}`
    }

    return method === 'POST'
      ? this.got
          .post(endpoint, {
            headers: {
              'OK-ACCESS-TIMESTAMP': ts,
              'OK-ACCESS-SIGN': crypto.createHmac('sha256', this.secret).update(sign).digest('base64'),
            },
            json: params,
          })
          .json()
      : this.got
          .get(endpoint, {
            searchParams: params,
            headers: {
              'OK-ACCESS-TIMESTAMP': ts,
              'OK-ACCESS-SIGN': crypto.createHmac('sha256', this.secret).update(sign).digest('base64'),
            },
          })
          .json()
  }

  accounts(instrument) {
    return instrument ? this.private(`accounts/${instrument}`) : this.private('accounts')
  }

  ledger(instrument) {
    return this.private(`accounts/${instrument}/ledger`)
  }

  availability(instrument) {
    return instrument ? this.private(`accounts/${instrument}/availability`) : this.private('accounts/availability')
  }

  borrowed(instrument) {
    return instrument ? this.private(`accounts/${instrument}/borrowed`) : this.private('accounts/borrowed')
  }

  borrow(params) {
    return this.private('accounts/borrow', params, 'POST')
  }

  repayment(params) {
    return this.private('accounts/repayment', params, 'POST')
  }

  order(params) {
    return this.private('orders', { ...params, margin_trading: 2 }, 'POST')
  }

  orders(params) {
    return this.private('batch_orders', params, 'POST')
  }

  cancel(orderId) {
    return this.private(`cancel_orders/${orderId}`, undefined, 'POST')
  }

  cancelOrders(orders) {
    return this.private(`cancel_batch_orders`, orders, 'POST')
  }

  markPrice(instrument) {
    return this.public(`instruments/${instrument}/mark_price`)
  }
}
