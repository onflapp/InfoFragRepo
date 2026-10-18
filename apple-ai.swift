import Foundation
import FoundationModels

let arguments = CommandLine.arguments
var text = ""

while let line = readLine(strippingNewline: false) {
  text += line
}

let prompt = arguments[1] + ":\n\n" + text


do {
  let session = LanguageModelSession()
  let response = try await session.respond(to: prompt)
  print(response.content)
}
catch {
  print("error: \(error.localizedDescription)")
}
