import { gql } from 'apollo-server-express';

export const schema = gql`
  scalar DateTime

  input Pagination {
    limit: Int
    offset: Int
    orderBy: String
    sortDirection: SortDirection
  }

  ######################### DEPRECATED SOON #########################

  input CommonCrud {
    create: Boolean
    read: Boolean
    update: Boolean
    delete: Boolean
  }

  #############################################################

  type ImageGroup {
    small: String
    medium: String
    large: String
    original: String
  }

  enum SortDirection {
    ASC
    DESC
  }

  ##For Workspace and Task vis, basically identical to project's, I decided to make it a common.
  type CommonVisibilityWhitelist {
    teams: [CompanyTeam]
    members: [CompanyMember]
  }

  ##For Workspace and Task vis
  enum CommonVisibility {
    HIDDEN # Not shown (not selectable from UI)
    PUBLIC # Visible to all within the company
    ASSIGNED # Visible to teams, members and PICs assigned
    SPECIFIC # Manually-specified list of teams and members allowed
    PRIVATE # Only visible to the owner of the entity
  }
`;
