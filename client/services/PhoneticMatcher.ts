export function doubleMetaphone(name: string): [string, string] {
  if (!name || name.length === 0) return ['', ''];
  
  const input = name.toUpperCase().replace(/[^A-Z]/g, '');
  if (input.length === 0) return ['', ''];
  
  let primary = '';
  let secondary = '';
  let index = 0;
  const length = input.length;
  
  const at = (n: number) => input[n] || '';
  const stringAt = (start: number, ...patterns: string[]) => 
    patterns.some(p => input.slice(start, start + p.length) === p);
  
  if (stringAt(0, 'GN', 'KN', 'PN', 'WR', 'PS')) {
    index++;
  }
  
  if (at(0) === 'X') {
    primary += 'S';
    secondary += 'S';
    index++;
  }
  
  while (index < length && primary.length < 4) {
    const char = at(index);
    
    switch (char) {
      case 'A':
      case 'E':
      case 'I':
      case 'O':
      case 'U':
      case 'Y':
        if (index === 0) {
          primary += 'A';
          secondary += 'A';
        }
        index++;
        break;
        
      case 'B':
        primary += 'P';
        secondary += 'P';
        index += (at(index + 1) === 'B') ? 2 : 1;
        break;
        
      case 'C':
        if (stringAt(index, 'CH')) {
          primary += 'X';
          secondary += 'X';
          index += 2;
        } else if (stringAt(index, 'CI', 'CE', 'CY')) {
          primary += 'S';
          secondary += 'S';
          index++;
        } else {
          primary += 'K';
          secondary += 'K';
          index += stringAt(index, 'CC', 'CK', 'CQ') ? 2 : 1;
        }
        break;
        
      case 'D':
        if (stringAt(index, 'DG')) {
          if (stringAt(index + 2, 'I', 'E', 'Y')) {
            primary += 'J';
            secondary += 'J';
            index += 3;
          } else {
            primary += 'TK';
            secondary += 'TK';
            index += 2;
          }
        } else {
          primary += 'T';
          secondary += 'T';
          index += (at(index + 1) === 'D' || at(index + 1) === 'T') ? 2 : 1;
        }
        break;
        
      case 'F':
        primary += 'F';
        secondary += 'F';
        index += (at(index + 1) === 'F') ? 2 : 1;
        break;
        
      case 'G':
        if (stringAt(index + 1, 'H')) {
          if (index > 0 && !'AEIOU'.includes(at(index - 1))) {
            primary += 'K';
            secondary += 'K';
          } else if (index === 0) {
            if (at(index + 2) === 'I') {
              primary += 'J';
              secondary += 'J';
            } else {
              primary += 'K';
              secondary += 'K';
            }
          }
          index += 2;
        } else if (stringAt(index, 'GN')) {
          primary += 'N';
          secondary += 'KN';
          index += 2;
        } else if (stringAt(index + 1, 'I', 'E', 'Y')) {
          primary += 'J';
          secondary += 'K';
          index++;
        } else {
          primary += 'K';
          secondary += 'K';
          index += (at(index + 1) === 'G') ? 2 : 1;
        }
        break;
        
      case 'H':
        if ('AEIOU'.includes(at(index + 1)) && (index === 0 || 'AEIOU'.includes(at(index - 1)))) {
          primary += 'H';
          secondary += 'H';
          index += 2;
        } else {
          index++;
        }
        break;
        
      case 'J':
        primary += 'J';
        secondary += 'J';
        index += (at(index + 1) === 'J') ? 2 : 1;
        break;
        
      case 'K':
        primary += 'K';
        secondary += 'K';
        index += (at(index + 1) === 'K') ? 2 : 1;
        break;
        
      case 'L':
        primary += 'L';
        secondary += 'L';
        index += (at(index + 1) === 'L') ? 2 : 1;
        break;
        
      case 'M':
        primary += 'M';
        secondary += 'M';
        index += (at(index + 1) === 'M') ? 2 : 1;
        break;
        
      case 'N':
        primary += 'N';
        secondary += 'N';
        index += (at(index + 1) === 'N') ? 2 : 1;
        break;
        
      case 'P':
        if (at(index + 1) === 'H') {
          primary += 'F';
          secondary += 'F';
          index += 2;
        } else {
          primary += 'P';
          secondary += 'P';
          index += stringAt(index, 'PP', 'PB') ? 2 : 1;
        }
        break;
        
      case 'Q':
        primary += 'K';
        secondary += 'K';
        index += (at(index + 1) === 'Q') ? 2 : 1;
        break;
        
      case 'R':
        primary += 'R';
        secondary += 'R';
        index += (at(index + 1) === 'R') ? 2 : 1;
        break;
        
      case 'S':
        if (stringAt(index, 'SH')) {
          primary += 'X';
          secondary += 'X';
          index += 2;
        } else if (stringAt(index, 'SI')) {
          primary += 'S';
          secondary += 'S';
          index++;
        } else {
          primary += 'S';
          secondary += 'S';
          index += stringAt(index, 'SS', 'SC', 'SZ') ? 2 : 1;
        }
        break;
        
      case 'T':
        if (stringAt(index, 'TH')) {
          primary += '0';
          secondary += 'T';
          index += 2;
        } else if (stringAt(index, 'TI')) {
          primary += 'X';
          secondary += 'X';
          index++;
        } else {
          primary += 'T';
          secondary += 'T';
          index += stringAt(index, 'TT', 'TD') ? 2 : 1;
        }
        break;
        
      case 'V':
        primary += 'F';
        secondary += 'F';
        index += (at(index + 1) === 'V') ? 2 : 1;
        break;
        
      case 'W':
        if ('AEIOU'.includes(at(index + 1))) {
          primary += 'A';
          secondary += 'A';
        }
        index++;
        break;
        
      case 'X':
        primary += 'KS';
        secondary += 'KS';
        index += (at(index + 1) === 'X') ? 2 : 1;
        break;
        
      case 'Z':
        primary += 'S';
        secondary += 'S';
        index += (at(index + 1) === 'Z') ? 2 : 1;
        break;
        
      default:
        index++;
    }
  }
  
  return [primary.slice(0, 4), secondary.slice(0, 4)];
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  
  return dp[m][n];
}

export function phoneticSimilarity(name1: string, name2: string): number {
  const [p1a, p1b] = doubleMetaphone(name1);
  const [p2a, p2b] = doubleMetaphone(name2);
  
  if (p1a === p2a || p1a === p2b || p1b === p2a || p1b === p2b) {
    return 1.0;
  }
  
  const dist1 = levenshteinDistance(p1a, p2a);
  const dist2 = p1b && p2b ? levenshteinDistance(p1b, p2b) : dist1;
  const minDist = Math.min(dist1, dist2);
  const maxLen = Math.max(p1a.length, p2a.length, 1);
  
  return Math.max(0, 1 - (minDist / maxLen));
}

export function soundsLike(name1: string, name2: string): boolean {
  return phoneticSimilarity(name1, name2) >= 0.75;
}

export function getPhoneticCode(name: string): string {
  const [primary] = doubleMetaphone(name);
  return primary;
}

const nameVariantGroups: Record<string, string[]> = {
  'margaret': ['margot', 'maggie', 'meg', 'megan', 'peggy', 'greta', 'rita'],
  'elizabeth': ['liz', 'lizzy', 'beth', 'betsy', 'eliza', 'elsa', 'lisa', 'isabel'],
  'william': ['will', 'bill', 'billy', 'liam', 'willie'],
  'richard': ['rick', 'ricky', 'dick', 'rich', 'ricardo'],
  'robert': ['rob', 'robby', 'bob', 'bobby', 'bert'],
  'michael': ['mike', 'mikey', 'mick', 'miguel', 'michel', 'mikhail'],
  'james': ['jim', 'jimmy', 'jamie', 'diego', 'jacob'],
  'john': ['jack', 'johnny', 'jon', 'juan', 'giovanni', 'ivan', 'sean', 'jan', 'hans', 'joao'],
  'alexander': ['alex', 'xander', 'sandro', 'alejandro', 'alessandro'],
  'catherine': ['kate', 'katie', 'cathy', 'katya', 'catalina', 'katarina', 'karen'],
  'mary': ['maria', 'marie', 'miriam', 'marian', 'mariam'],
  'ann': ['anna', 'anne', 'anya', 'ana', 'annika', 'annette'],
  'victoria': ['vicky', 'tori', 'vittoria'],
  'theodore': ['theo', 'ted', 'teddy'],
  'joseph': ['joe', 'joey', 'jose', 'giuseppe', 'yosef'],
  'nicholas': ['nick', 'nicky', 'nicolas', 'nikolai', 'nikos', 'klaus'],
  'david': ['dave', 'davey'],
  'peter': ['pete', 'pedro', 'pierre', 'piotr'],
  'paul': ['pablo', 'paolo', 'pavel'],
  'andrew': ['andy', 'drew', 'andres', 'andrea'],
  'thomas': ['tom', 'tommy', 'tomas'],
  'charles': ['charlie', 'chuck', 'carlos', 'carlo'],
  'henry': ['harry', 'henri', 'enrique'],
  'daniel': ['dan', 'danny'],
  'sophia': ['sophie', 'sofia'],
  'rose': ['rosa', 'rosie', 'rosalie', 'rosalind'],
  'helen': ['helena', 'elena', 'eleni', 'ellen'],
  'alice': ['alicia', 'alison'],
  'grace': ['gracie', 'grazia'],
  'florence': ['flo', 'flora', 'florencia'],
  'lucy': ['lucia', 'lucille', 'luz'],
  'emily': ['emilia', 'emilie', 'emma'],
  'laura': ['lauren', 'laurel', 'lori'],
  'sarah': ['sara', 'sarai'],
  'rachel': ['raquel'],
  'rebecca': ['rebekah', 'becky', 'becca'],
  'jessica': ['jess', 'jessie'],
  'jennifer': ['jenny', 'jen'],
  'christopher': ['chris', 'kit', 'cristobal'],
  'anthony': ['tony', 'antonio', 'antoine'],
  'matthew': ['matt', 'mateo', 'matteo', 'mattheus'],
  'stephen': ['steve', 'steven', 'stefan', 'etienne'],
  'edward': ['ed', 'eddie', 'ted', 'ned', 'eduardo'],
  'patrick': ['pat', 'paddy', 'patryk'],
  'george': ['jorge', 'giorgio'],
  'francis': ['frank', 'frankie', 'francisco', 'francesco'],
  'benjamin': ['ben', 'benji', 'benjamin'],
  'samuel': ['sam', 'sammy'],
  'gabriel': ['gabe', 'gabrielle', 'gabriela'],
  'natalie': ['natalia', 'natasha', 'nadia'],
  'christina': ['chris', 'kristina', 'cristina', 'tina'],
  'caroline': ['carol', 'carolina', 'carla'],
  'julia': ['julie', 'juliana', 'juliette', 'juliet'],
  'diana': ['diane', 'dianna'],
  'linda': ['lynda'],
  'angela': ['angelina', 'angel', 'angie'],
  'veronica': ['vera', 'ronnie'],
  'monica': ['monique'],
  'teresa': ['theresa', 'terri', 'tess'],
  'albert': ['al', 'bert', 'alberto'],
  'frederick': ['fred', 'freddy', 'fritz', 'federico'],
  'arthur': ['art', 'arturo'],
  'louis': ['lou', 'luis', 'luigi', 'ludwig'],
  'lawrence': ['larry', 'lorenzo', 'laurent'],
  'raymond': ['ray', 'ramon'],
  'leonard': ['leo', 'leon', 'leonardo'],
  'frank': ['francis', 'francisco', 'franco'],
  'martin': ['marty'],
};

export function isVariant(name1: string, name2: string): boolean {
  const n1 = name1.toLowerCase();
  const n2 = name2.toLowerCase();
  
  if (n1 === n2) return true;
  
  for (const [base, variants] of Object.entries(nameVariantGroups)) {
    const allVariants = [base, ...variants];
    if (allVariants.includes(n1) && allVariants.includes(n2)) {
      return true;
    }
  }
  
  return false;
}

export function getSimilarityScore(candidateName: string, ancestorName: string): {
  score: number;
  matchType: 'exact' | 'variant' | 'phonetic' | 'initial' | 'partial' | 'none';
} {
  const c = candidateName.toLowerCase();
  const a = ancestorName.toLowerCase();
  
  if (c === a) {
    return { score: 100, matchType: 'exact' };
  }
  
  if (isVariant(c, a)) {
    return { score: 85, matchType: 'variant' };
  }
  
  const phonScore = phoneticSimilarity(c, a);
  if (phonScore >= 0.9) {
    return { score: 75, matchType: 'phonetic' };
  }
  if (phonScore >= 0.75) {
    return { score: 60, matchType: 'phonetic' };
  }
  
  if (c[0] === a[0]) {
    if (c.slice(0, 2) === a.slice(0, 2)) {
      return { score: 40, matchType: 'initial' };
    }
    return { score: 25, matchType: 'initial' };
  }
  
  if (c.includes(a.slice(0, 3)) || a.includes(c.slice(0, 3))) {
    return { score: 30, matchType: 'partial' };
  }
  
  if (phonScore >= 0.5) {
    return { score: 20, matchType: 'phonetic' };
  }
  
  return { score: 0, matchType: 'none' };
}

export function findSimilarNames(
  ancestorName: string,
  allNames: Array<{ name: string; origins: string[] }>,
  limit: number = 20
): Array<{ name: string; score: number; matchType: string }> {
  const results = allNames.map(n => {
    const { score, matchType } = getSimilarityScore(n.name, ancestorName);
    return { name: n.name, score, matchType };
  });
  
  return results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
