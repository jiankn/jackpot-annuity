import json
from pathlib import Path

project = 'jackpot-annuity'
author = 'Jackpot Calculator'
release = json.loads((Path(__file__).parent.parent / 'package.json').read_text())['version']
extensions = []
html_theme = 'alabaster'
html_title = 'jackpot-annuity: schedules, present value and CSV'
# Set the public documentation origin explicitly after a Read the Docs import.
import os
html_baseurl = os.environ.get('READTHEDOCS_CANONICAL_URL', '')
