const rcRaceHtml = `
  <hr />
  <h3 id="contest_{CONTEST_INDEX}">{CONTEST_NAME}</h3>
  <h4>{VOTING_INSTRUCTIONS}</h4>
  <table aria-label="{CONTEST_NAME}" class="{CLASS_NAME}">
      {HEADER_ROW}
      {CANDIDATE_ROWS}
  </table>`


const qRaceHtml = `
  <hr />
  <div class="questionDiv">
  <h3 id="contest_{CONTEST_INDEX}">{CONTEST_NAME}</h3>
  <h4>{VOTING_INSTRUCTIONS}</h4>
  <p class="question">{QUESTION_TEXT}</p>
  <div class="questionOptionsDiv">
    {QUESTION_OPTIONS}
  </div>
  </div>
  `

const rRaceHtml = `
  <hr />
  <h3 id="contest_{CONTEST_INDEX}">{CONTEST_NAME}</h3>
  <h4>{VOTING_INSTRUCTIONS}</h4>
  <div class="regCandidates">
    {CANDIDATES}
  </div>
  `

const candidateRegLine = `
  <div class="indivCandidate">
    <label class="container candidateLabel">
      <input type="checkbox" id="{OVAL_ID}" aria-label="{CANDIDATE_ARIA_LABEL}">
      <span class="checkmark ballotCheckbox" aria-hidden="true"></span>
      <div class="candidateNameDiv">
      <p class="bold">{CANDIDATE_NAME}</p>
      <p class="indent">{CANDIDATE_SUBTITLE}</p>
      </div>
    </label>
  </div>
  `

const candidateRegWriteIn = `
  <div class="indivCandidate">
    <label class="container candidateLabel">
      <input type="checkbox" id="{OVAL_ID}" aria-label="{WRITEIN_ARIA_LABEL}">
      <span class="checkmark ballotCheckbox"></span><p class="bold">Write-in:</p>
      <input id="{OVAL_ID}_w" type="text" class="writebox" readonly>
      </label>
  </div>
  `
const questionOption = `
  <div class="questionOption">
    <label>
      <input id="{OVAL_ID}" type="checkbox" aria-label="{OPTION_ARIA_LABEL}">
      <span></span>{OPTION_NAME}
    </label>
  </div>
`

const headerRowHtml = `<tr class="header-row"><td>Candidate</td>{CHOICES}</tr>`

const choiceHtml = `<td><span>{ORDINAL} <span class="{CLASS_NAME}">Choice</span></span></td>`

const candidateRowHtml = `<tr>{CANDIDATE} {OVALS}</tr>`

const candidateHtml = `<td class="candidate-name">{CANDIDATE_NAME}<p>{CANDIDATE_SUBTITLE}</p></td>`

const writeinHtml = `
          <td class="writein-name">
              <label for="{INPUT_ID}">Write-in: </label>
              <input type="text" id="{INPUT_ID}" aria-label="write-in" disabled>
          </td>`

const ovalHtml = `
          <td><label class="container">
              <input type="checkbox" id="{OVAL_ID}" aria-label="{OVAL_ARIA_LABEL}">
              <span class="checkmark" aria-hidden="true"></span>
          </label></td>`



function buildRace(race, raceIndex) {
  if (race.contestType === 'RC') {
    return buildRankChoiceRace(race, raceIndex)
  } else if (race.contestType === 'Q') {
    return buildQuestionRace(race, raceIndex)
  } else {
    return buildRegRace(race, raceIndex)
  }
}

function buildRegRace(race, raceIndex) {
  let txt = rRaceHtml
    .replace('{CONTEST_INDEX}', raceIndex)
    .replace(/{CONTEST_NAME}/g, race.contestName)
    .replace('{VOTING_INSTRUCTIONS}', race.votingInstructions)
    .replace('{VOTE_LIMIT}', race.voteFor)
    .replace(/{CANDIDATES}/g, buildRegCandidates(race, raceIndex))
  // console.log(txt)
  return txt
}

function buildRegCandidates(race, raceIndex) {
  let txt = ''
  race.candidates.forEach((candidate, candidateIndex) => {

    if (candidate.candidateCode.includes('writein')) {
      txt += candidateRegWriteIn
        .replace(/{OVAL_ID}/g, raceIndex + '_' + candidateIndex)
        .replace('{WRITEIN_ARIA_LABEL}', buildWriteinAriaLabel(raceIndex, candidateIndex))
    } else {
      txt += candidateRegLine
        .replace(/{CANDIDATE_NAME}/g, candidate.candidateName)
        .replace('{OVAL_ID}', raceIndex + '_' + candidateIndex)
        .replace('{CANDIDATE_ARIA_LABEL}', buildCandidateAriaLabel(raceIndex, candidateIndex))
        .replace('{CANDIDATE_SUBTITLE}', candidate.candidateSubtitle)
    }
  })
  return txt
}

function buildQuestionOptions(race, raceIndex) {
  let txt = ''
  race.candidates.forEach((candidate, candidateIndex) => {
      txt += questionOption
        .replace(/{OPTION_NAME}/g, candidate.candidateName)
        .replace('{OVAL_ID}', raceIndex + '_' + candidateIndex)
        .replace('{OPTION_ARIA_LABEL}', buildOptionAriaLabel(raceIndex, candidateIndex))
  })
  return txt
}

function buildOptionAriaLabel(raceIndex, candidateIndex) {
  let txt = ''
    txt += 'Race ' + (raceIndex+1) + ' of ' + ballot.contests.length + ' '
    txt += 'This is a ballot question. '
    txt += ballot.contests[raceIndex].contestName + '. '
    txt += 'Option ' + (candidateIndex + 1) + ' of ' + ballot.contests[raceIndex].candidates.length + ': '
    txt += ballot.contests[raceIndex].candidates[candidateIndex].candidateName
    return txt
  return txt
}

function buildQuestionRace(race, raceIndex) {
  let txt = qRaceHtml
    .replace('{CONTEST_INDEX}', raceIndex)
    .replace(/{CONTEST_NAME}/g, race.contestName)
    .replace('{VOTING_INSTRUCTIONS}', race.votingInstructions)
    .replace('{QUESTION_TEXT}', race.questionText.replace(/\\n/g, '<br>'))
    .replace(/{CONTEST_INDEX}/g, raceIndex)
    .replace('{QUESTION_OPTIONS}', buildQuestionOptions(race, raceIndex))
  return txt
}

function buildRankChoiceRace(race, raceIndex) {
  let choices = race.candidates.length
  let cls = choiceClassName(choices)
  let txt = rcRaceHtml
    .replace('{CONTEST_INDEX}', raceIndex)
    .replace(/{CONTEST_NAME}/g, race.contestName)
    .replace(/{CLASS_NAME}/g, cls)
    .replace('{VOTING_INSTRUCTIONS}', race.votingInstructions)
    .replace('{HEADER_ROW}', buildHeaderRow(choices, cls))
    .replace('{CANDIDATE_ROWS}', buildCandidateRows(race, choices, raceIndex))
  return txt
}

function choiceClassName(choices) {
  let cls
  if (choices < 4)
    cls = 'choices-2-3'
  else if (choices < 6)
    cls = 'choices-4-5'
  else if (choices < 8)
    cls = 'choices-6-7'
  else if (choices < 10)
    cls = 'choices-8-9'
  else
    cls = 'choices-10-plus'
  return cls
}

function choiceLabel(choice) {
  let lbl
  if (choice == 1)
    lbl = '1st'
  else if (choice == 2)
    lbl = '2nd'
  else if (choice == 3)
    lbl = '3rd'
  else
    lbl = choice + 'th'
  return lbl
}

function buildHeaderRow(choices, cls) {
  let cells = ''
  for (let choice = 1; choice <= choices; choice++) {
    cells += choiceHtml
      .replace(/{ORDINAL}/g, choiceLabel(choice))
      .replace(/{CLASS_NAME}/g, cls)
  }
  return headerRowHtml.replace('{CHOICES}', cells)
}

function buildCandidateRows(race, choices, raceIndex) {
  let txt = ''
  race.candidates.forEach((candidate, candidateIndex) => {
    txt += candidateRowHtml
      .replace('{CANDIDATE}', buildCandidateCell(race.contestCode, candidate, raceIndex, candidateIndex))
      .replace('{OVALS}', buildOvalCells(race, choices, candidate, raceIndex, candidateIndex))
  })
  return txt
}

function buildCandidateCell(contestCode, candidate, raceIndex, candidateIndex) {
  if (candidate.candidateCode.includes('writein'))
    return writeinHtml.replace(/{INPUT_ID}/g, raceIndex + '_' + candidateIndex + '_w')
  else
    return candidateHtml.replace('{CANDIDATE_NAME}', candidate.candidateName)
                        .replace('{CANDIDATE_SUBTITLE}', candidate.candidateSubtitle)

}

function buildOvalCells(race, choices, candidate, raceIndex, candidateIndex) {
  let txt = ''
  for (let choice = 0; choice < choices; choice++) {
    let ovalId = raceIndex + '_' + candidateIndex + '_' + choice
    let nameOfContest = ballot.contests[raceIndex].contestName
    let instructions = ballot.contests[raceIndex].votingInstructions
    let lbl = contestInfoString(raceIndex) + ' ' + candidateInfoString(raceIndex, candidateIndex)
    if (candidate.candidateCode.includes('writein'))
      lbl = contestInfoString(raceIndex) + ' ' + 'Write-in'
    lbl += ' ' + choiceLabel(choice+1) + ' choice'
    txt += ovalHtml.replace(/{OVAL_ID}/g, ovalId).replace(/{OVAL_ARIA_LABEL}/g, lbl)
  }
  return txt
}

function contestInfoString(raceIndex) {
    let txt = ''
    txt += 'Race ' + (raceIndex+1) + ' of ' + ballot.contests.length + ': '
    txt += ballot.contests[raceIndex].contestName + '. '
    txt += ballot.contests[raceIndex].votingInstructions + '.'
    return txt
}

function candidateInfoString(raceIndex, candidateIndex) {
    let txt = ''
    let lastCandidate = ballot.contests[raceIndex].candidates[ballot.contests[raceIndex].candidates.length - 1]
    let numOfTotalCandidates = ballot.contests[raceIndex].candidates.length
    let numOfWriteins = ballot.contests[raceIndex].candidates.filter((x) => x.candidateCode.includes('writein')).length
    let candidateName = ballot.contests[raceIndex].candidates[candidateIndex].candidateName
    let candidateSubtitle = ballot.contests[raceIndex].candidates[candidateIndex].candidateSubtitle
    if (numOfWriteins > 0) {
        numOfTotalCandidates -= numOfWriteins   // reduce total candidates by the number of write-ins 
    }
    txt += 'Candidate ' + (candidateIndex + 1) + ' of ' + numOfTotalCandidates + ': '
    txt += candidateName + ', ' + candidateSubtitle
    return txt
}

function buildCandidateAriaLabel(raceIndex, candidateIndex) {
    let txt = ''
    txt += contestInfoString(raceIndex, candidateIndex) + ' '
    txt += candidateInfoString(raceIndex, candidateIndex)
    return txt
}

function buildWriteinAriaLabel(raceIndex, candidateIndex) {
    let txt = ''
    txt += contestInfoString(raceIndex, candidateIndex) + ' '
    txt += 'Write-in'
    return txt
}