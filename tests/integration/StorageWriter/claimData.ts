import { lensPath, over } from 'ramda'
import { encode, decode } from 'utf8'

const content = lensPath(['attributes', 'content'])

function cleanString(input: string) {
  let output = ''
  for (var i=0; i<input.length; i++) {
      if (input.charCodeAt(i) <= 127) {
          output += input.charAt(i)
      }
  }
  return output
}

export const cleanContent = over(content, cleanString)
export const encodeContent = over(content, encode)
export const decodeContent = over(content, decode)

export const invalidUtf8CharactersClaim = {
	"id":"4304c9239ef1fa6b86872f21c040b2c3c13361c610d12fcd3007b0b663d7ce7b",
	"publicKey":"024cd0fe4c33231ca7c1d76f6fe00689f5872bcd4bc5557ab4cd2c5691b49c25a3",
	"signature":"304402200b06264c113d46200c0b7cd10d244832ba0dd1b798460ce846fd4477070be21f02206bdcb4bba8d568a98567bd59b8cb874086b51407d1f39e6b898dca248d863d09",
	"type":"Work",
	"created":"2018-09-13T23:23:44.750Z",
	"attributes": {
		"name":"Test",
		"author":"Test",
		"content":"these chars: öüäüüüüäüüüüßßä'üüßüääöüäööäääääßüüüßüüäüöüößüüöüüäöääüäööüüüüääüüüäöüäääöüü are causing me problems"
	}
}

export const normalClaim = {
	"id":"af7b4ecbd1d719226b5b420190d8928cf6245d86470cc81ccda5801e5040f658",
	"publicKey":"024cd0fe4c33231ca7c1d76f6fe00689f5872bcd4bc5557ab4cd2c5691b49c25a3",
	"signature":"3045022100d43b1430af16311c36505604b0b721e1f7717a7673681f605c0137ae657ce3f102203e6ef5c743abcfc2fe0829cdfc7a06c4341ce74f18cca37b1ce678b3c089c821",
	"type":"Work",
	"created":"2018-09-13T23:26:06.715Z",
	"attributes": {
		"name":"Test",
		"author":"Test",
		"content":"no problem mann!"
	}
}

