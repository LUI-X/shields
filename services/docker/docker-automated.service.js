'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
} = require('./docker-helpers')

const automatedBuildSchema = Joi.object({
  is_automated: Joi.boolean().required(),
}).required()

module.exports = class DockerAutomatedBuild extends BaseJsonService {
  static category = 'build'
  static route = buildDockerUrl('automated')
  static examples = [
    {
      title: 'Docker Automated build',
      namedParams: {
        user: 'jrottenberg',
        repo: 'ffmpeg',
      },
      staticPreview: this.render({ isAutomated: true }),
    },
  ]

  static defaultBadgeData = { label: 'docker build' }

  static render({ isAutomated }) {
    if (isAutomated) {
      return { message: 'automated', color: dockerBlue }
    } else {
      return { message: 'manual', color: 'yellow' }
    }
  }

  async fetch({ user, repo }) {
    return this._requestJson({
      schema: automatedBuildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user
      )}/${repo}`,
      errorMessages: { 404: 'repo not found' },
    })
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    return this.constructor.render({ isAutomated: data.is_automated })
  }
}
