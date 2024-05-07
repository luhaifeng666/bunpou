/*
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2024-04-24 20:26:26
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2024-05-08 00:48:41
 * @Description: 
 */
import { SpeechConfig, SpeechSynthesizer, ResultReason } from "microsoft-cognitiveservices-speech-sdk";

export const generateVoice = function (text, cb) {
  return new Promise((resolve, reject) => {
    const speechConfig = SpeechConfig.fromSubscription("13b2f831ad854c13962db4ddfbbe6647", "eastus");

    // The language of the voice that speaks.
    speechConfig.speechSynthesisVoiceName = "ja-JP-ShioriNeural";

    // Create the speech synthesizer.
    var synthesizer = new SpeechSynthesizer(speechConfig);

    // Start the synthesizer and wait for a result.
    synthesizer.speakTextAsync(text,
      function (result) {
        let success = true;
        if (result.reason === ResultReason.SynthesizingAudioCompleted) {
        } else {
          console.error("Speech synthesis canceled, " + result.errorDetails +
            "\nDid you set the speech resource key and region values?");
          success = false
        }
        const timer = setTimeout(() => {
          cb && cb()
          clearTimeout(timer)
        }, result.audioDuration / 1e4)
        synthesizer = null;
        success ? resolve(success) : reject(success)
      },
      function (err) {
        console.error("err - " + err);
        synthesizer.close();
        synthesizer = null;
        reject(false)
      });
  })
};
