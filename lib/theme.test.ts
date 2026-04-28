import { describe, it, expect } from 'vitest';
import { getAvatarBgClass } from './theme';

describe('getAvatarBgClass', () => {
  it('returns bg-avatar-main when isMainPerson is true', () => {
    expect(getAvatarBgClass('male', true)).toBe('bg-avatar-main');
    expect(getAvatarBgClass('female', true)).toBe('bg-avatar-main');
    expect(getAvatarBgClass(undefined, true)).toBe('bg-avatar-main');
  });

  it('returns bg-avatar-female for female when not main', () => {
    expect(getAvatarBgClass('female', false)).toBe('bg-avatar-female');
    expect(getAvatarBgClass('female')).toBe('bg-avatar-female');
  });

  it('returns bg-avatar-male for male when not main', () => {
    expect(getAvatarBgClass('male', false)).toBe('bg-avatar-male');
    expect(getAvatarBgClass('male')).toBe('bg-avatar-male');
  });

  it('returns bg-avatar-neutral for other/undefined when not main', () => {
    expect(getAvatarBgClass('other')).toBe('bg-avatar-neutral');
    expect(getAvatarBgClass(undefined)).toBe('bg-avatar-neutral');
  });
});
