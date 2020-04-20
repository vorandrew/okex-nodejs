import Margin from './margin'

export default function (key, secret, passphrase) {
  return {
    margin: new Margin(
      key || process.env['OK-ACCESS-KEY'],
      secret || process.env['OK-ACCESS-SECRET'],
      passphrase || process.env['OK-ACCESS-PASSPHRASE']
    ),
  }
}
