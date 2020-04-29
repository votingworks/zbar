import { detect } from '.'
import { promises as fs } from 'fs'
import { join } from 'path'
import { PNG } from 'pngjs'

test('no image data', () => {
  // @ts-ignore
  expect(() => detect()).toThrow('Expected image data (Buffer or typed array)')
})

test('invalid image data', () => {
  // @ts-ignore
  expect(() => detect([0, 0, 0, 255], 1, 1)).toThrow(
    'Expected image data (Buffer or typed array)'
  )
})

test('no width', () => {
  // @ts-ignore
  expect(() => detect(Buffer.of(0, 0, 0, 255))).toThrow('A number was expected')
})

test('no height', () => {
  // @ts-ignore
  expect(() => detect(Buffer.of(0, 0, 0, 255), 1)).toThrow(
    'A number was expected'
  )
})

test('reading a simple QR code', async () => {
  const png = PNG.sync.read(
    await fs.readFile(join(__dirname, '../examples/qr-code.png'))
  )
  expect(detect(png.data, png.width, png.height)).toMatchInlineSnapshot(`
    Array [
      Object {
        "data": Object {
          "data": Array [
            104,
            116,
            116,
            112,
            115,
            58,
            47,
            47,
            103,
            105,
            116,
            104,
            117,
            98,
            46,
            99,
            111,
            109,
            47,
            109,
            99,
            104,
            101,
            104,
            97,
            98,
            47,
            122,
            98,
            97,
            114,
          ],
          "type": "Buffer",
        },
        "locations": Array [
          Object {
            "x": 1,
            "y": 1,
          },
          Object {
            "x": 0,
            "y": 98,
          },
          Object {
            "x": 100,
            "y": 100,
          },
          Object {
            "x": 98,
            "y": 0,
          },
        ],
        "orientation": 0,
        "quality": 1,
        "type": 64,
      },
    ]
  `)
})
